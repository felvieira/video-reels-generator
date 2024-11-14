// src-tauri/src/video_processor.rs
use std::path::{Path, PathBuf};
use tokio::process::Command;
use std::env;
use serde::{Serialize, Deserialize};
use tauri::Window;
use tauri::api::dialog::blocking::FileDialogBuilder;
use tokio::io::{BufReader, AsyncBufReadExt};
use regex::Regex;

#[derive(Debug, Serialize, Clone)]
pub struct ProcessProgress {
    pub stage: String,
    pub progress: f32,
}

#[derive(Debug, Deserialize)]
pub struct VideoQuality {
    preset: String,
    crf: String,
}

pub struct VideoProcessor {
    ffmpeg_path: PathBuf,
    has_nvidia_gpu: bool,
}

impl VideoProcessor {
    pub fn new() -> Self {
        let exe_dir = env::current_exe()
            .expect("Failed to get executable path")
            .parent()
            .expect("Failed to get executable directory")
            .to_path_buf();
            
        let ffmpeg_path = if cfg!(windows) {
            exe_dir.join("resources").join("ffmpeg.exe")
        } else {
            exe_dir.join("resources").join("ffmpeg")
        };
        
        println!("FFmpeg path: {:?}", ffmpeg_path);
        
        if !ffmpeg_path.exists() {
            println!("ERRO: FFmpeg não encontrado em {:?}", ffmpeg_path);
        }

        // Detectar GPU NVIDIA
        let has_nvidia_gpu = Self::check_nvidia_gpu();
        println!("GPU NVIDIA detectada: {}", has_nvidia_gpu);
        
        Self { 
            ffmpeg_path,
            has_nvidia_gpu
        }
    }

    // Função para detectar GPU NVIDIA
    fn check_nvidia_gpu() -> bool {
        let output = if cfg!(windows) {
            std::process::Command::new("wmic")
                .args(["path", "win32_videocontroller", "get", "name"])
                .output()
        } else {
            std::process::Command::new("lspci")
                .output()
        };

        match output {
            Ok(output) => {
                let output_str = String::from_utf8_lossy(&output.stdout).to_lowercase();
                output_str.contains("nvidia")
            },
            Err(_) => false
        }
    }

    // Função para testar se NVENC está disponível
    async fn test_nvenc(&self) -> bool {
        if !self.has_nvidia_gpu {
            return false;
        }

        let output = Command::new(&self.ffmpeg_path)
            .args(["-encoders"])
            .output()
            .await;

        match output {
            Ok(output) => {
                let output_str = String::from_utf8_lossy(&output.stdout).to_lowercase();
                output_str.contains("h264_nvenc")
            },
            Err(_) => false
        }
    }

    pub async fn process_video(
        &self,
        input_path: &Path,
        quality: &str,
        window: &Window
    ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        println!("Iniciando processamento do vídeo");
        println!("Caminho de entrada: {:?}", input_path);
        println!("Qualidade: {}", quality);
        
        if !input_path.exists() {
            return Err(format!("Arquivo de entrada não encontrado: {:?}", input_path).into());
        }

        let quality_settings = match quality {
            "high" => VideoQuality { 
                preset: "slow".into(),
                crf: "18".into()
            },
            "medium" => VideoQuality { 
                preset: "medium".into(),
                crf: "23".into()
            },
            "low" => VideoQuality { 
                preset: "ultrafast".into(),
                crf: "28".into()
            },
            _ => VideoQuality { 
                preset: "medium".into(),
                crf: "23".into()
            }
        };

        let temp_dir = std::env::temp_dir();
        let content_path = temp_dir.join("content.mp4");
        let face_path = temp_dir.join("face.mp4");
        let output_path = temp_dir.join("output.mp4");

        self.emit_progress(&window, "Extraindo conteúdo...", 0.0)?;

        println!("Executando FFmpeg para extrair conteúdo...");
        let mut child = Command::new(&self.ffmpeg_path)
            .arg("-y")
            .arg("-i")
            .arg(input_path.to_str().unwrap())
            .arg("-vf")
            .arg("crop=iw*0.66:ih:0:0")
            .arg("-c:v")
            .arg("libx264")
            .arg("-preset")
            .arg(&quality_settings.preset)
            .arg("-crf")
            .arg(&quality_settings.crf)
            .arg("-progress")
            .arg("-")
            .arg(content_path.to_str().unwrap())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()?;

        let stdout = child.stdout.take().unwrap();
        let mut reader = BufReader::new(stdout);
        let mut line = String::new();
        let duration_re = Regex::new(r"Duration: (\d{2}):(\d{2}):(\d{2})").unwrap();
        let time_re = Regex::new(r"time=(\d{2}):(\d{2}):(\d{2})").unwrap();

        let window_clone = window.clone();
        let mut total_duration = 0.0;

        // Ler o progresso de forma assíncrona
        while reader.read_line(&mut line).await? > 0 {
            if let Some(caps) = duration_re.captures(&line) {
                let hours: f32 = caps[1].parse().unwrap_or(0.0);
                let minutes: f32 = caps[2].parse().unwrap_or(0.0);
                let seconds: f32 = caps[3].parse().unwrap_or(0.0);
                total_duration = hours * 3600.0 + minutes * 60.0 + seconds;
            }
            
            if let Some(caps) = time_re.captures(&line) {
                let hours: f32 = caps[1].parse().unwrap_or(0.0);
                let minutes: f32 = caps[2].parse().unwrap_or(0.0);
                let seconds: f32 = caps[3].parse().unwrap_or(0.0);
                let current_time = hours * 3600.0 + minutes * 60.0 + seconds;
                
                if total_duration > 0.0 {
                    let progress = (current_time / total_duration * 30.0).min(30.0);
                    let _ = window_clone.emit("conversion-progress", ProcessProgress {
                        stage: "Extraindo conteúdo...".into(),
                        progress
                    });
                }
            }
            line.clear();
        }

        let status = child.wait().await?;
        if !status.success() {
            let mut stderr = String::new();
            if let Some(mut stderr_handle) = child.stderr {
                tokio::io::AsyncReadExt::read_to_string(&mut stderr_handle, &mut stderr).await?;
            }
            println!("Erro no FFmpeg: {}", stderr);
            return Err(format!("Erro no FFmpeg: {}", stderr).into());
        }

        self.emit_progress(&window, "Extraindo face...", 30.0)?;

        let output = Command::new(&self.ffmpeg_path)
            .arg("-y")
            .arg("-i")
            .arg(input_path.to_str().unwrap())
            .arg("-vf")
            .arg("crop=iw*0.34:ih/2:iw*0.66:ih/2")
            .arg("-c:v")
            .arg("libx264")
            .arg("-preset")
            .arg(&quality_settings.preset)
            .arg("-crf")
            .arg(&quality_settings.crf)
            .arg(face_path.to_str().unwrap())
            .output()
            .await?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            println!("Erro no FFmpeg: {}", error);
            return Err(format!("Erro no FFmpeg: {}", error).into());
        }

        self.emit_progress(&window, "Combinando vídeos...", 60.0)?;

        let output = Command::new(&self.ffmpeg_path)
            .arg("-y")
            .arg("-i")
            .arg(content_path.to_str().unwrap())
            .arg("-i")
            .arg(face_path.to_str().unwrap())
            .arg("-filter_complex")
            .arg("[0:v]scale=1080:1440:force_original_aspect_ratio=decrease,pad=1080:1440:(ow-iw)/2:(oh-ih)/2[v0];[1:v]scale=1080:480:force_original_aspect_ratio=decrease,pad=1080:480:(ow-iw)/2:(oh-ih)/2[v1];[v0][v1]vstack")
            .arg("-c:v")
            .arg("libx264")
            .arg("-preset")
            .arg(&quality_settings.preset)
            .arg("-pix_fmt")
            .arg("yuv420p")
            .arg("-crf")
            .arg(&quality_settings.crf)
            .arg(output_path.to_str().unwrap())
            .output()
            .await?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            println!("Erro no FFmpeg: {}", error);
            return Err(format!("Erro no FFmpeg: {}", error).into());
        }

        self.emit_progress(&window, "Finalizando...", 90.0)?;

        self.emit_progress(&window, "Salvando vídeo...", 95.0)?;

        // Pegar o nome do arquivo original
        let input_filename = input_path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("video");

        // Criar nome sugerido
        let suggested_name = format!("{}_reels.mp4", input_filename.trim_end_matches(".mp4"));

        // Abrir diálogo de salvar
        let save_path = FileDialogBuilder::new()
            .set_title("Salvar Vídeo")
            .set_file_name(&suggested_name)
            .add_filter("Vídeo MP4", &["mp4"])
            .save_file();

        match save_path {
            Some(path) => {
                // Copiar o arquivo temporário para o destino escolhido
                std::fs::copy(&output_path, &path)?;
                
                // Limpar arquivos temporários - APENAS AQUI, não antes
                if std::fs::metadata(&content_path).is_ok() {
                    let _ = std::fs::remove_file(&content_path);
                }
                if std::fs::metadata(&face_path).is_ok() {
                    let _ = std::fs::remove_file(&face_path);
                }
                if std::fs::metadata(&output_path).is_ok() {
                    let _ = std::fs::remove_file(&output_path);
                }

                self.emit_progress(&window, "Concluído!", 100.0)?;

                Ok(path.to_string_lossy().into_owned())
            },
            None => Err("Operação cancelada pelo usuário".into())
        }
    }

    fn emit_progress(&self, window: &Window, stage: &str, progress: f32) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        window.emit("conversion-progress", ProcessProgress {
            stage: stage.to_string(),
            progress
        })?;
        Ok(())
    }
}
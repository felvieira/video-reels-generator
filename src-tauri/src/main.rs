#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod video_processor;
use video_processor::{VideoProcessor, ProcessProgress};
use tauri::State;
use std::path::{Path, PathBuf};
use std::env;
use std::fs;
use tokio::process::Command;
use tokio::io::AsyncBufReadExt;
use reqwest::Client;
use serde_json::json;
use reqwest::multipart::{Form, Part};
use std::fs::File;
use std::io::Read;

#[tauri::command]
fn get_file_path(path: String) -> String {
    let path_buf = PathBuf::from(path);
    path_buf.to_string_lossy().into_owned()
}

#[tauri::command]
async fn convert_to_reels<'a>(
    input_path: String,
    quality: String,
    state: State<'a, VideoProcessor>,
    window: tauri::Window
) -> Result<String, String> {
    let processor = state.inner();
    
    // Usar o VideoProcessor para processar o vídeo com as proporções corretas
    processor
        .process_video(
            Path::new(&input_path),
            &quality,
            &window
        )
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_absolute_path(path: String) -> Result<String, String> {
    println!("Obtendo caminho absoluto para: {}", path);
    
    let path = std::path::Path::new(&path);
    
    // Se já é absoluto, retornar como está
    if path.is_absolute() {
        println!("Caminho já é absoluto: {:?}", path);
        return Ok(path.to_string_lossy().into_owned());
    }

    // Se é relativo, converter para absoluto
    match std::env::current_dir() {
        Ok(mut current_dir) => {
            current_dir.push(path);
            match current_dir.canonicalize() {
                Ok(absolute_path) => {
                    println!("Caminho absoluto obtido: {:?}", absolute_path);
                    Ok(absolute_path.to_string_lossy().into_owned())
                },
                Err(e) => {
                    println!("Erro ao canonicalizar caminho: {}", e);
                    Err(format!("Erro ao obter caminho absoluto: {}", e))
                }
            }
        },
        Err(e) => {
            println!("Erro ao obter diretório atual: {}", e);
            Err(format!("Erro ao obter diretório atual: {}", e))
        }
    }
}

#[tauri::command]
fn check_file_exists(path: String) -> Result<bool, String> {
    println!("Verificando arquivo com caminho original: {:?}", path);
    
    // Converter para PathBuf e resolver caminho absoluto
    let path_buf = PathBuf::from(path);
    let absolute_path = std::env::current_dir()
        .map_err(|e| format!("Erro ao obter diretório atual: {}", e))?
        .join(path_buf);

    println!("Caminho absoluto resolvido: {:?}", absolute_path);
    
    if absolute_path.exists() {
        println!("Arquivo encontrado!");
        Ok(true)
    } else {
        println!("Arquivo não encontrado no caminho: {:?}", absolute_path);
        Err(format!("Arquivo não encontrado: {:?}", absolute_path))
    }
}

#[tauri::command]
async fn download_youtube(url: String, window: tauri::Window) -> Result<String, String> {
    println!("Baixando vídeo do YouTube: {}", url);
    
    let ytdlp_path = env::current_exe()
        .expect("Failed to get executable path")
        .parent()
        .expect("Failed to get executable directory")
        .join("resources")
        .join("yt-dlp.exe");
    
    println!("Caminho do yt-dlp: {:?}", ytdlp_path);
    
    let temp_dir = std::env::temp_dir();
    let output_path = temp_dir.join("youtube_video.mp4");
    
    // Remover arquivo anterior se existir
    if output_path.exists() {
        std::fs::remove_file(&output_path)
            .map_err(|e| format!("Erro ao remover arquivo anterior: {}", e))?;
    }
    
    let mut child = Command::new(&ytdlp_path)
        .args([
            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "-o", output_path.to_str().unwrap(),
            "--progress",
            "--newline",
            &url
        ])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Erro ao executar yt-dlp: {}", e))?;

    let stdout = child.stdout.take().unwrap();
    let mut reader = tokio::io::BufReader::new(stdout);
    let mut line = String::new();
    let mut last_progress = 0.0;

    while let Ok(n) = reader.read_line(&mut line).await {
        if n == 0 {
            break;
        }
        
        if line.contains("[download]") && line.contains("%") {
            if let Some(percent_str) = line
                .split_whitespace()
                .find(|s| s.ends_with('%'))
                .map(|s| s.trim_end_matches('%')) 
            {
                if let Ok(percent) = percent_str.parse::<f32>() {
                    if percent > last_progress {
                        last_progress = percent;
                        println!("Progresso do download: {}%", percent);
                        window.emit("youtube-progress", percent).map_err(|e| e.to_string())?;
                    }
                }
            }
        }
        
        line.clear();
    }

    let status = child.wait().await
        .map_err(|e| format!("Erro ao aguardar yt-dlp: {}", e))?;

    if !status.success() {
        let mut stderr = String::new();
        if let Some(mut stderr_handle) = child.stderr {
            tokio::io::AsyncReadExt::read_to_string(&mut stderr_handle, &mut stderr).await
                .map_err(|e| format!("Erro ao ler stderr: {}", e))?;
        }
        return Err(format!("Erro ao baixar vídeo: {}", stderr));
    }

    Ok(output_path.to_string_lossy().into_owned())
}

#[tauri::command]
async fn save_youtube_video(source_path: String, destination_path: String) -> Result<(), String> {
    std::fs::copy(source_path, destination_path)
        .map_err(|e| format!("Erro ao salvar vídeo: {}", e))?;
    Ok(())
}

#[tauri::command]
async fn create_stripe_session(email: String, product_id: String) -> Result<String, String> {
    let client = Client::new();
    let stripe_secret = std::env::var("STRIPE_SECRET_KEY")
        .map_err(|_| "Stripe secret key not found".to_string())?;

    let response = client
        .post("https://api.stripe.com/v1/checkout/sessions")
        .header("Authorization", format!("Bearer {}", stripe_secret))
        .form(&json!({
            "payment_method_types": ["card"],
            "line_items": [{
                "price_data": {
                    "currency": "brl",
                    "product": product_id,
                    "unit_amount": 9900, // R$ 99,00
                },
                "quantity": 1,
            }],
            "mode": "payment",
            "success_url": "https://appwrite-backend.felvieira.com.br/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://appwrite-backend.felvieira.com.br/cancel",
            "customer_email": email,
            "metadata": {
                "email": email
            }
        }))
        .send()
        .await
        .map_err(|e| format!("Failed to create Stripe session: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Stripe API error: {}", response.status()));
    }

    let session: serde_json::Value = response.json()
        .await
        .map_err(|e| format!("Failed to parse Stripe response: {}", e))?;

    let url = session["url"].as_str()
        .ok_or("No URL in Stripe response")?
        .to_string();

    Ok(url)
}

#[tauri::command]
async fn transcribe_video(input_path: String, content_type: String, window: tauri::Window) -> Result<String, String> {
    println!("Transcrevendo vídeo: {}", input_path);
    
    // Primeiro extrair o áudio do vídeo
    let temp_dir = std::env::temp_dir();
    let audio_path = temp_dir.join("extracted_audio.mp3");
    
    let ffmpeg_path = env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or("Falha ao obter diretório pai")?
        .join("resources")
        .join(if cfg!(windows) { "ffmpeg.exe" } else { "ffmpeg" });

    // Emitir progresso
    window.emit("conversion-progress", ProcessProgress {
        stage: "Extraindo áudio...".into(),
        progress: 0.0
    }).map_err(|e| e.to_string())?;

    // Extrair áudio usando FFmpeg
    let status = Command::new(&ffmpeg_path)
        .args([
            "-i", &input_path,
            "-vn", // Desabilita vídeo
            "-acodec", "libmp3lame",
            "-q:a", "4", // Qualidade do áudio
            audio_path.to_str().unwrap()
        ])
        .status()
        .await
        .map_err(|e| e.to_string())?;

    if !status.success() {
        return Err("Falha ao extrair áudio do vídeo".into());
    }

    window.emit("conversion-progress", ProcessProgress {
        stage: "Transcrevendo áudio...".into(),
        progress: 50.0
    }).map_err(|e| e.to_string())?;

    // Pegar a chave da OpenAI das configurações
    let config = tauri::api::path::local_data_dir()
        .ok_or("Não foi possível encontrar diretório de dados")?
        .join("llmConfig.json");

    let config_str = std::fs::read_to_string(config)
        .map_err(|_| "Configurações não encontradas. Configure a chave da API nas configurações.")?;

    let config_json: serde_json::Value = serde_json::from_str(&config_str)
        .map_err(|_| "Erro ao ler configurações")?;

    let openai_key = config_json["openai"]["apiKey"]
        .as_str()
        .ok_or("Chave da API OpenAI não encontrada nas configurações")?;

    // Criar o form multipart corretamente
    let mut file = File::open(audio_path.to_str().unwrap())
        .map_err(|e| format!("Erro ao abrir arquivo: {}", e))?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)
        .map_err(|e| format!("Erro ao ler arquivo: {}", e))?;

    let part = Part::bytes(buffer)
        .file_name("audio.mp3")
        .mime_str("audio/mp3")
        .map_err(|e| format!("Erro ao criar parte do multipart: {}", e))?;

    let form = Form::new()
        .part("file", part)
        .text("model", "whisper-1")
        .text("language", "pt");

    // Fazer a requisição para a OpenAI
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.openai.com/v1/audio/transcriptions")
        .header("Authorization", format!("Bearer {}", openai_key))
        .multipart(form)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("Erro na API: {}", response.status()));
    }

    let result: serde_json::Value = response
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let transcription = result["text"]
        .as_str()
        .ok_or("Texto não encontrado na resposta")?
        .to_string();

    window.emit("conversion-progress", ProcessProgress {
        stage: "Gerando conteúdo...".into(),
        progress: 75.0
    }).map_err(|e| e.to_string())?;

    // Se o tipo de conteúdo for hashtags, vamos gerar hashtags usando GPT
    if content_type == "hashtags" {
        let completion = client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", openai_key))
            .json(&serde_json::json!({
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um especialista em gerar hashtags relevantes para conteúdo."
                    },
                    {
                        "role": "user",
                        "content": format!("Gere hashtags relevantes para este texto: {}", transcription)
                    }
                ]
            }))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let result: serde_json::Value = completion
            .json()
            .await
            .map_err(|e| e.to_string())?;

        window.emit("conversion-progress", ProcessProgress {
            stage: "Concluído!".into(),
            progress: 100.0
        }).map_err(|e| e.to_string())?;

        return Ok(result["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or(&transcription)
            .to_string());
    }

    window.emit("conversion-progress", ProcessProgress {
        stage: "Concluído!".into(),
        progress: 100.0
    }).map_err(|e| e.to_string())?;

    Ok(transcription)
}

#[tauri::command]
async fn transcribe_audio(input_path: String, content_type: String) -> Result<String, String> {
    println!("Transcrevendo áudio: {}", input_path);
    println!("Tipo de conteúdo: {}", content_type);
    
    // Implementar a lógica de transcrição de áudio aqui
    Ok("Transcrição de áudio não implementada ainda".into())
}

#[tauri::command]
async fn save_converted_video(source_path: String, destination_path: String) -> Result<(), String> {
    std::fs::copy(source_path, destination_path)
        .map_err(|e| format!("Erro ao salvar vídeo: {}", e))?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(VideoProcessor::new())
        .invoke_handler(tauri::generate_handler![
            convert_to_reels, 
            get_file_path,
            get_absolute_path,
            check_file_exists,
            download_youtube,
            save_youtube_video,
            create_stripe_session,
            transcribe_video,
            transcribe_audio,
            save_converted_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
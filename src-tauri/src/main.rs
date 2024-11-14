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
    let path = Path::new(&path);
    
    if path.is_absolute() {
        return Ok(path.to_string_lossy().into_owned());
    }

    match env::current_dir() {
        Ok(mut current_dir) => {
            current_dir.push(path);
            match current_dir.canonicalize() {
                Ok(absolute_path) => Ok(absolute_path.to_string_lossy().into_owned()),
                Err(e) => Err(format!("Erro ao converter caminho: {}", e))
            }
        },
        Err(e) => Err(format!("Erro ao obter diretório atual: {}", e))
    }
}

#[tauri::command]
fn check_file_exists(path: String) -> Result<bool, String> {
    println!("Verificando existência do arquivo: {}", path);
    let exists = fs::metadata(&path).is_ok();
    println!("Arquivo existe: {}", exists);
    if !exists {
        Err(format!("Arquivo não encontrado: {}", path))
    } else {
        Ok(true)
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
            create_stripe_session
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
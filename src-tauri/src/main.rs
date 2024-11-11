#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod video_processor;
use video_processor::VideoProcessor;
use tauri::State;
use std::path::{Path, PathBuf};
use std::env;
use std::fs;

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
    
    // Se já é absoluto, retorna como está
    if path.is_absolute() {
        return Ok(path.to_string_lossy().into_owned());
    }

    // Se é relativo, converte para absoluto
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

fn main() {
    tauri::Builder::default()
        .manage(VideoProcessor::new())
        .invoke_handler(tauri::generate_handler![
            convert_to_reels, 
            get_file_path,
            get_absolute_path,
            check_file_exists
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
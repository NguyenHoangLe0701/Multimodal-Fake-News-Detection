import os
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.utils.data import DataLoader
from transformers import AutoTokenizer
from tqdm import tqdm
from sklearn.metrics import accuracy_score, f1_score

from models import MultimodalFakeNewsModel
from data_loader import MultimodalDataset

def train_model():
    # ── Hyperparameters ──
    BATCH_SIZE = 16
    EPOCHS = 3
    LEARNING_RATE = 2e-5
    TEXT_MODEL_NAME = 'vinai/phobert-base'
    
    # ── Paths ──
    # Adjust these paths if running on Colab or if your data structure differs
    TRAIN_CSV = 'train.csv'
    VAL_CSV = 'val.csv'
    IMG_DIR = 'images/'
    SAVE_DIR = 'model_weights/'
    
    # Check if data exists
    if not os.path.exists(TRAIN_CSV):
        print(f"Error: Could not find training data at {TRAIN_CSV}")
        print("Vui lòng tải các file train.csv, val.csv và thư mục images/ lên Colab cho đúng đường dẫn.")
        return

    os.makedirs(SAVE_DIR, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # ── Setup ──
    print("Loading tokenizer and model...")
    tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_NAME)
    model = MultimodalFakeNewsModel(text_model_name=TEXT_MODEL_NAME, num_classes=2)
    model.to(device)

    print("Loading datasets...")
    train_dataset = MultimodalDataset(TRAIN_CSV, IMG_DIR, tokenizer)
    val_dataset = MultimodalDataset(VAL_CSV, IMG_DIR, tokenizer)
    
    # If running out of memory, reduce num_workers or batch_size
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE)
    criterion = nn.CrossEntropyLoss()

    # ── Training Loop ──
    best_val_f1 = 0.0

    for epoch in range(EPOCHS):
        print(f"\n--- Epoch {epoch+1}/{EPOCHS} ---")
        
        # Training Phase
        model.train()
        train_loss = 0.0
        train_preds, train_labels = [], []
        
        # Use tqdm for progress bar
        train_pbar = tqdm(train_loader, desc="Training")
        for batch in train_pbar:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            images = batch['images'].to(device)
            labels = batch['labels'].to(device)

            optimizer.zero_grad()
            outputs = model(input_ids, attention_mask, images)
            loss = criterion(outputs, labels)
            
            loss.backward()
            optimizer.step()

            train_loss += loss.item()
            _, preds = torch.max(outputs, 1)
            train_preds.extend(preds.cpu().numpy())
            train_labels.extend(labels.cpu().numpy())
            
            train_pbar.set_postfix({'loss': loss.item()})

        # Calculate Training Metrics
        train_acc = accuracy_score(train_labels, train_preds)
        train_f1 = f1_score(train_labels, train_preds, average='macro')
        
        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_preds, val_labels = [], []
        
        with torch.no_grad():
            val_pbar = tqdm(val_loader, desc="Validating")
            for batch in val_pbar:
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                images = batch['images'].to(device)
                labels = batch['labels'].to(device)

                outputs = model(input_ids, attention_mask, images)
                loss = criterion(outputs, labels)

                val_loss += loss.item()
                _, preds = torch.max(outputs, 1)
                val_preds.extend(preds.cpu().numpy())
                val_labels.extend(labels.cpu().numpy())

        # Calculate Validation Metrics
        val_acc = accuracy_score(val_labels, val_preds)
        val_f1 = f1_score(val_labels, val_preds, average='macro')
        
        print(f"\nEpoch {epoch+1} Results:")
        print(f"Train Loss: {train_loss/len(train_loader):.4f} | Train Acc: {train_acc:.4f} | Train F1: {train_f1:.4f}")
        print(f"Val Loss:   {val_loss/len(val_loader):.4f} | Val Acc:   {val_acc:.4f} | Val F1:   {val_f1:.4f}")

        # Save Best Model
        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            save_path = os.path.join(SAVE_DIR, 'model.pth')
            torch.save(model.state_dict(), save_path)
            print(f"--> Saved new best model to {save_path} (F1: {best_val_f1:.4f})")

    print("\nTraining Complete!")

if __name__ == "__main__":
    train_model()

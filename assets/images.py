import os
import json
from tkinter import Tk, filedialog

def get_image_files(folder_path):
    """Get all image files from the specified folder"""
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    image_files = []
    
    for filename in os.listdir(folder_path):
        if os.path.splitext(filename)[1].lower() in image_extensions:
            image_files.append(filename)
    
    return sorted(image_files)

def generate_image_data(image_files):
    """Generate the image data structure"""
    images = []
    for i, filename in enumerate(image_files, start=1):
        images.append({
            "filename": filename,
            "alt": f"Photo {i}",
            "caption": f"Photo {i}"
        })
    return images

def select_folder():
    """Open a dialog to select a folder"""
    root = Tk()
    root.withdraw()  # Hide the main window
    folder_path = filedialog.askdirectory(title="Select Folder Containing Images")
    return folder_path

def main():
    # Select folder
    folder_path = select_folder()
    if not folder_path:
        print("No folder selected. Exiting...")
        return
    
    # Get image files
    image_files = get_image_files(folder_path)
    if not image_files:
        print("No image files found in the selected folder.")
        return
    
    # Generate JSON structure
    data = {
        "album": "photo-collection",
        "images": generate_image_data(image_files)
    }
    
    # Save to JSON file
    output_path = os.path.join(folder_path, "images.json")
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=4)
    
    print(f"JSON file created successfully at: {output_path}")

if __name__ == "__main__":
    main()
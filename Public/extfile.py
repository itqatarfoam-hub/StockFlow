import os
import struct
import tkinter as tk
from tkinter import filedialog

def select_folder():
    print("[+] Script started")
    root = tk.Tk()
    root.withdraw()
    print("[+] Opening folder selection dialog...")
    folder_path = filedialog.askdirectory()
    if folder_path:
        print(f"[+] Selected folder: {folder_path}")
        return folder_path
    else:
        print("[-] No folder selected. Exiting.")
        exit()

def find_dd_file(folder_path):
    for fname in os.listdir(folder_path):
        if fname.lower().endswith('.dd'):
            file_path = os.path.join(folder_path, fname)
            print(f"[*] Found image: {file_path}")
            return file_path
    print("[-] No .dd file found in the folder.")
    exit()

def scan_image_for_fve_metadata(file_path):
    print(f"[*] Scanning for FVE metadata in {file_path}...")
    metadata_offsets = []
    block_size = 0x4000  # 16 KB
    search_signature = b'-FVE-FS-'
    file_size = os.path.getsize(file_path)

    with open(file_path, 'rb') as f:
        offset = 0
        while offset < file_size:
            f.seek(offset)
            data = f.read(len(search_signature))
            if data == search_signature:
                metadata_offsets.append(offset)
                print(f"[+] Found FVE metadata at offset: 0x{offset:x}")
            offset += 0x1000  # step size for scanning
    return metadata_offsets

def parse_and_dump_metadata(file_path, metadata_offsets):
    print(f"[*] Extracting and dumping raw FVE metadata blocks...")
    with open(file_path, 'rb') as f:
        for i, offset in enumerate(metadata_offsets):
            f.seek(offset)
            data = f.read(0x4000)  # read 16KB block
            dump_name = f"fve_metadata_block_{i:02d}_0x{offset:x}.bin"
            with open(dump_name, 'wb') as dump_file:
                dump_file.write(data)
            print(f"[+] Dumped metadata block #{i} at offset 0x{offset:x} to {dump_name}")

def main():
    folder_path = select_folder()
    file_path = find_dd_file(folder_path)

    if not os.path.isfile(file_path):
        print("[-] File does not exist.")
        return

    print(f"[+] File exists and ready to parse: {file_path}")
    metadata_offsets = scan_image_for_fve_metadata(file_path)

    if metadata_offsets:
        parse_and_dump_metadata(file_path, metadata_offsets)
    else:
        print("[!] No metadata blocks found.")

if __name__ == "__main__":
    main()

import os
import shutil
import json

def create(folder_num, data_list):
    # Base directory path
    base_path = '/app/tools/data'
    folder_path = os.path.join(base_path, str(folder_num))

    # Delete the folder if it exists to clean up any previous data
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)

    # Create main folder and 'in' and 'out' subfolders
    os.makedirs(folder_path, exist_ok=True)
    in_folder = os.path.join(folder_path, 'in')
    out_folder = os.path.join(folder_path, 'out')
    os.makedirs(in_folder, exist_ok=True)
    os.makedirs(out_folder, exist_ok=True)

    # Iterate through the data list to create files in respective folders
    for idx, data in enumerate(data_list, start=1):
        # Input file
        input_file_path = os.path.join(in_folder, f"{idx}.in")
        with open(input_file_path, 'w') as f:
            f.write(data['input'])

        # Output file
        output_file_path = os.path.join(out_folder, f"{idx}.out")
        with open(output_file_path, 'w') as f:
            f.write(data['output'])


def get_data(folder_num, request_id):
    # Base directory path
    base_path = '/app/tools/data'
    folder_path = os.path.join(base_path, str(folder_num))

    # Initialize data list to collect extracted data
    data_list = []

    # Define paths for 'in' and 'out' folders
    in_folder = os.path.join(folder_path, 'in')
    out_folder = os.path.join(folder_path, 'out')

    # Check if the folders exist before proceeding
    if not os.path.exists(in_folder) or not os.path.exists(out_folder):
        raise FileNotFoundError(f"The specified folder structure for folder number {folder_num} does not exist.")

    # Get the list of input files, sorted by their numeric filename
    in_files = sorted(os.listdir(in_folder), key=lambda x: int(os.path.splitext(x)[0]))

    for in_file in in_files:
        # Extract the base filename without extension (e.g., '1' from '1.in')
        base_name = os.path.splitext(in_file)[0]

        # Define corresponding input and output file paths
        input_file_path = os.path.join(in_folder, in_file)
        output_file_path = os.path.join(out_folder, f"{base_name}.out")

        # Read the input file
        with open(input_file_path, 'r') as f:
            input_data = f.read()

        # Read the output file
        with open(output_file_path, 'r') as f:
            output_data = f.read()

        # Append to data_list in the required format
        data_list.append({
            'input': input_data,
            'output': output_data
        })
    dict_response = {
        'operation': 'response',
        'data': data_list,
        'requestId': request_id
    }
    response = json.dumps(dict_response)
    return response

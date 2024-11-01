import os

def create(folder_num, data_list):
    # Base directory path
    base_path = '/app/tools/data'
    folder_path = os.path.join(base_path, str(folder_num))

    # Create main folder
    os.makedirs(folder_path, exist_ok=True)

    # Create 'in' and 'out' folders inside the main folder
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


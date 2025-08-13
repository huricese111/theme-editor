import re

def parse_bike_data(file_path):
    """
    Parse bike type data from the text file and convert to structured format
    """
    structured_options = []
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Split content by sections (separated by dashes)
    sections = content.split('---------------------------------------------------------------')
    
    for section in sections:
        lines = [line.strip() for line in section.strip().split('\n') if line.strip()]
        
        if not lines:
            continue
            
        # Get the bike model from the first line (remove colon)
        bike_model = lines[0].replace('：', '').replace(':', '').strip()
        
        # Skip if it's just a separator or empty
        if not bike_model or bike_model.startswith('-'):
            continue
            
        # Process each configuration line
        for line in lines[1:]:
            if '|' in line:
                # Handle pipe-separated format (Trekking 7 LTD, Trekking 7 SE)
                parts = [part.strip() for part in line.split('|')]
                if len(parts) >= 4:
                    battery_type = parts[0]
                    step_type = parts[1]
                    size = parts[2]
                    color = parts[3]
                    structured_options.append(f"{bike_model}|{battery_type}|{step_type}|{size}|{color}")
            elif '/' in line:
                # Handle slash-separated format (Trekking 7, Mountain 7, etc.)
                parts = [part.strip() for part in line.split('/')]
                
                if bike_model == 'Mountain 7' or bike_model == 'Mountain 7 Carbon':
                    # Mountain bikes have different format: Battery/Size/Color
                    if len(parts) >= 3:
                        battery_type = parts[0]
                        size = parts[1]
                        color = parts[2] if parts[2] else ''
                        structured_options.append(f"{bike_model}|{battery_type}|{size}|{color}")
                    elif len(parts) == 2:
                        # Mountain 7 Carbon without color
                        battery_type = parts[0]
                        size = parts[1]
                        structured_options.append(f"{bike_model}|{battery_type}|{size}")
                elif bike_model == 'City 7':
                    # City bikes format: Battery/Size/Color or Battery/Step/Size/Color
                    if len(parts) >= 3:
                        if 'Step Through' in line or 'High Step' in line:
                            battery_type = parts[0]
                            step_type = parts[1]
                            size = parts[2]
                            color = parts[3] if len(parts) > 3 else 'Dark Blue'
                            structured_options.append(f"{bike_model}|{battery_type}|{step_type}|{size}|{color}")
                        else:
                            battery_type = parts[0]
                            size = parts[1]
                            color = parts[2] if parts[2] else 'Mid Grey'
                            structured_options.append(f"{bike_model}|{battery_type}|{size}|{color}")
                else:
                    # Trekking 7 format: Battery/Step/Size/Color
                    if len(parts) >= 4:
                        battery_type = parts[0]
                        step_type = parts[1]
                        size = parts[2]
                        color = parts[3]
                        structured_options.append(f"{bike_model}|{battery_type}|{step_type}|{size}|{color}")
    
    return structured_options

def update_liquid_file(liquid_file_path, new_options):
    """
    Update the enhanced-form.liquid file with new structured options
    """
    with open(liquid_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Create the new default value string
    new_default = '\\n'.join(new_options)
    
    # Find and replace the structured_options default value
    pattern = r'("id":\s*"structured_options"[^}]*"default":\s*")([^"]*)("[^}]*})'
    
    def replace_default(match):
        return match.group(1) + new_default + match.group(3)
    
    updated_content = re.sub(pattern, replace_default, content, flags=re.DOTALL)
    
    # Write back to file
    with open(liquid_file_path, 'w', encoding='utf-8') as file:
        file.write(updated_content)
    
    return len(new_options)

def main():
    """
    Main function to convert bike data and update liquid file
    """
    bike_data_file = r'e:\Hepha theme editor\assets\bike type.txt'
    liquid_file = r'e:\Hepha theme editor\sections\enhanced-form.liquid'
    
    try:
        # Parse bike data
        print("Parsing bike data from bike type.txt...")
        structured_options = parse_bike_data(bike_data_file)
        
        print(f"Found {len(structured_options)} bike configurations:")
        for i, option in enumerate(structured_options[:5]):  # Show first 5 as preview
            print(f"  {i+1}. {option}")
        if len(structured_options) > 5:
            print(f"  ... and {len(structured_options) - 5} more")
        
        # Update liquid file
        print("\nUpdating enhanced-form.liquid file...")
        updated_count = update_liquid_file(liquid_file, structured_options)
        
        print(f"Successfully updated {updated_count} structured options in enhanced-form.liquid")
        print("Conversion completed successfully!")
        
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
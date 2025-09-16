import csv
import json
import os

def convert_csv_to_readable_format(input_file, output_file):
    """将CSV文件转换为更易读的JSON格式"""
    try:
        # 读取CSV文件
        with open(input_file, 'r', encoding='utf-8') as csvfile:
            # 使用csv模块读取
            reader = csv.DictReader(csvfile)
            # 将每行转换为字典并存储在列表中
            data = []
            for row in reader:
                # 过滤掉空值
                filtered_row = {k: v for k, v in row.items() if v.strip()}
                data.append(filtered_row)
        
        # 将数据写入JSON文件
        with open(output_file, 'w', encoding='utf-8') as jsonfile:
            json.dump(data, jsonfile, indent=4, ensure_ascii=False)
        
        print(f"转换完成！数据已保存到 {output_file}")
        return True
    except Exception as e:
        print(f"转换过程中出错: {e}")
        return False

def print_readable_format(input_file):
    """将CSV文件转换为可读格式并打印到控制台"""
    try:
        # 读取CSV文件
        with open(input_file, 'r', encoding='utf-8') as csvfile:
            # 使用csv模块读取
            reader = csv.DictReader(csvfile)
            # 获取所有字段名
            fieldnames = reader.fieldnames
            
            # 读取前5行数据用于展示
            rows = []
            for i, row in enumerate(reader):
                if i < 5:  # 只读取前5行
                    rows.append(row)
                else:
                    break
            
            # 打印每个产品的信息
            for i, row in enumerate(rows):
                print(f"\n产品 {i+1}:")
                print("-" * 40)
                for field in fieldnames:
                    if field in row and row[field].strip():
                        print(f"{field}: {row[field]}")
                print("-" * 40)
        
        return True
    except Exception as e:
        print(f"读取过程中出错: {e}")
        return False

def main():
    # 文件路径
    input_file = os.path.join(os.path.dirname(__file__), 'assets', '20250812_HEPHA_MY26_Product_Data.csv')
    output_file = os.path.join(os.path.dirname(__file__), 'assets', 'bike_data.json')
    
    # 转换为JSON格式
    convert_csv_to_readable_format(input_file, output_file)
    
    # 打印可读格式
    print("\n以下是CSV数据的可读格式示例（前5条记录）:")
    print_readable_format(input_file)

if __name__ == "__main__":
    main()
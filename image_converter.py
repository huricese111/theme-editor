import os
import argparse
from PIL import Image
import glob
from tqdm import tqdm

def convert_image(input_path, output_path, width=600, height=800, bg_color=(255, 255, 255)):
    """
    将图片转换为指定尺寸的JPG格式，保持原图比例并居中显示在白色背景上
    
    参数:
        input_path: 输入图片路径
        output_path: 输出图片路径
        width: 输出图片宽度
        height: 输出图片高度
        bg_color: 背景颜色，默认为白色 (255, 255, 255)
    """
    try:
        # 打开图片
        img = Image.open(input_path)
        
        # 如果图片有透明通道，需要将其转换为RGB模式并填充白色背景
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            # 创建白色背景图片
            background = Image.new('RGB', img.size, bg_color)
            # 将原图粘贴到背景上
            if img.mode == 'RGBA':
                background.paste(img, mask=img.split()[3])  # 使用alpha通道作为蒙版
            else:
                background.paste(img)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # 计算调整后的尺寸，保持原图比例
        img_width, img_height = img.size
        ratio = min(width / img_width, height / img_height)
        new_size = (int(img_width * ratio), int(img_height * ratio))
        resized_img = img.resize(new_size, Image.LANCZOS)
        
        # 创建指定尺寸的白色背景图片
        new_img = Image.new('RGB', (width, height), bg_color)
        
        # 计算粘贴位置（居中）
        paste_x = (width - new_size[0]) // 2
        paste_y = (height - new_size[1]) // 2
        
        # 将调整后的图片粘贴到背景上
        new_img.paste(resized_img, (paste_x, paste_y))
        
        # 保存为JPG格式
        new_img.save(output_path, 'JPEG', quality=95)
        return True
    except Exception as e:
        print(f"处理图片 {input_path} 时出错: {e}")
        return False

def batch_convert(input_dir, output_dir=None, width=600, height=800):
    """
    批量转换指定目录下的所有图片
    
    参数:
        input_dir: 输入目录路径
        output_dir: 输出目录路径，如果为None，则使用输入目录下的output文件夹
        width: 输出图片宽度
        height: 输出图片高度
    """
    # 如果未指定输出目录，则使用输入目录下的output文件夹
    if output_dir is None:
        output_dir = os.path.join(input_dir, 'output')
    
    # 创建输出目录（如果不存在）
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # 支持的图片格式
    supported_formats = ['*.png', '*.jpg', '*.jpeg', '*.webp', '*.bmp', '*.tiff', '*.tif']
    image_files = []
    
    # 获取所有支持格式的图片文件
    for format_pattern in supported_formats:
        image_files.extend(glob.glob(os.path.join(input_dir, format_pattern)))
        image_files.extend(glob.glob(os.path.join(input_dir, format_pattern.upper())))
    
    if not image_files:
        print(f"在 {input_dir} 中没有找到支持的图片文件")
        return
    
    print(f"找到 {len(image_files)} 个图片文件，开始处理...")
    
    # 使用tqdm显示进度条
    success_count = 0
    for img_path in tqdm(image_files, desc="转换进度"):
        # 生成输出文件路径，添加3x4后缀
        filename = os.path.basename(img_path)
        name, ext = os.path.splitext(filename)
        output_path = os.path.join(output_dir, f"{name}_3x4.jpg")
        
        # 转换图片
        if convert_image(img_path, output_path, width, height):
            success_count += 1
    
    print(f"处理完成! 成功转换 {success_count}/{len(image_files)} 个图片")
    print(f"转换后的图片保存在: {os.path.abspath(output_dir)}")

def main():
    # 创建命令行参数解析器
    parser = argparse.ArgumentParser(description='批量将图片转换为指定尺寸的JPG格式，保持原图比例并居中显示在白色背景上')
    parser.add_argument('-i', '--input', required=True, help='输入图片目录路径')
    parser.add_argument('-o', '--output', help='输出图片目录路径，默认为输入目录下的output文件夹')
    parser.add_argument('-w', '--width', type=int, default=600, help='输出图片宽度，默认为600')
    parser.add_argument('-t', '--height', type=int, default=800, help='输出图片高度，默认为800')
    
    # 解析命令行参数
    args = parser.parse_args()
    
    # 批量转换图片
    batch_convert(args.input, args.output, args.width, args.height)

if __name__ == '__main__':
    main()
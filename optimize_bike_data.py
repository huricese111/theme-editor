import json
import os
import copy
from collections import defaultdict

# 文件路径
input_file = os.path.join('assets', 'bike_data.json')
output_file = os.path.join('assets', 'bike_data_optimized.json')

# 读取原始数据
with open(input_file, 'r', encoding='utf-8') as f:
    bikes_data = json.load(f)

# 变体属性分析函数
def analyze_variant_attributes(bikes_data):
    # 收集所有可能的frameType, frameSize, frameSizeCm, frameSizeLetter, marketingColor值
    frame_types = set()
    frame_sizes = set()
    frame_sizes_cm = set()
    frame_size_letters = set()
    marketing_colors = set()
    
    # 收集每个型号的变体信息
    model_variants = defaultdict(set)
    
    for bike in bikes_data:
        if 'frameType' in bike:
            frame_types.add(bike['frameType'])
        if 'frameSize' in bike:
            frame_sizes.add(bike['frameSize'])
        if 'frameSizeCm' in bike:
            frame_sizes_cm.add(bike['frameSizeCm'])
        if 'frameSizeLetter' in bike:
            frame_size_letters.add(bike['frameSizeLetter'])
        if 'marketingColor' in bike:
            marketing_colors.add(bike['marketingColor'])
        
        # 收集每个型号的变体
        if 'modelNameVariant' in bike and 'frameType' in bike and 'frameSizeLetter' in bike and 'marketingColor' in bike:
            model_name = bike['modelNameVariant']
            # 创建完整的变体描述，例如 "High Step, L (52cm), Blue Grey"
            variant_desc = f"{bike['frameType']}, {bike['frameSizeLetter']} ({bike['frameSizeCm']}cm), {bike['marketingColor']}"
            model_variants[model_name].add(variant_desc)
    
    return {
        'frame_types': sorted(list(frame_types)),
        'frame_sizes': sorted(list(frame_sizes)),
        'frame_sizes_cm': sorted(list(frame_sizes_cm)),
        'frame_size_letters': sorted(list(frame_size_letters)),
        'marketing_colors': sorted(list(marketing_colors)),
        'model_variants': {k: sorted(list(v)) for k, v in model_variants.items()}
    }

# 合并同一型号不同变体的公共数据
def optimize_bike_data(bikes_data):
    # 按modelNameVariant分组
    model_groups = defaultdict(list)
    for bike in bikes_data:
        if 'modelNameVariant' in bike:
            model_groups[bike['modelNameVariant']].append(bike)
    
    optimized_data = []
    
    # 处理每个型号组
    for model_name, variants in model_groups.items():
        # 如果只有一个变体，直接添加
        if len(variants) <= 1:
            optimized_data.extend(variants)
            continue
        
        # 找出变体特有的属性和共享属性
        variant_specific_attrs = {
            'frameSize', 'frameSizeCm', 'frameSizeLetter', 'frameType', 'marketingColor',
            'articleNumber', 'GTIN', 'lengthStem', 'lengthCrankset', 'frameGlossiness'
        }
        
        # 创建基础模型（包含共享属性）
        base_model = copy.deepcopy(variants[0])
        
        # 创建变体列表（只包含变体特有属性）
        size_variants = []
        
        for variant in variants:
            size_variant = {}
            # 提取变体特有属性
            for attr in variant_specific_attrs:
                if attr in variant:
                    size_variant[attr] = variant[attr]
            
            # 创建完整的变体描述
            if all(key in variant for key in ['frameType', 'frameSizeLetter', 'frameSizeCm', 'marketingColor']):
                variant_desc = f"{variant['frameType']}, {variant['frameSizeLetter']} ({variant['frameSizeCm']}cm), {variant['marketingColor']}"
                size_variant['variantDescription'] = variant_desc
            
            # 添加变体ID
            if all(key in variant for key in ['frameType', 'frameSizeLetter', 'marketingColor']):
                frame_type_key = variant['frameType'].replace(' ', '_')
                color_key = variant['marketingColor'].replace(' ', '_')
                size_variant['variantId'] = f"{model_name}_{frame_type_key}_{variant['frameSizeLetter']}_{color_key}"
            
            size_variants.append(size_variant)
        
        # 从基础模型中移除变体特有属性
        for attr in variant_specific_attrs:
            if attr in base_model:
                del base_model[attr]
        
        # 添加变体列表到基础模型
        base_model['variants'] = size_variants
        
        # 添加到优化后的数据
        optimized_data.append(base_model)
    
    return optimized_data

# 主函数
def main():
    # 分析变体属性
    variant_analysis = analyze_variant_attributes(bikes_data)
    print("变体属性分析结果:")
    print(f"框架类型 (frameType): {variant_analysis['frame_types']}")
    print(f"框架尺寸 (frameSize): {variant_analysis['frame_sizes']}")
    print(f"框架尺寸厘米 (frameSizeCm): {variant_analysis['frame_sizes_cm']}")
    print(f"框架尺寸字母 (frameSizeLetter): {variant_analysis['frame_size_letters']}")
    print(f"营销颜色 (marketingColor): {variant_analysis['marketing_colors']}")
    
    # 打印每个型号的变体
    print("\n各型号的变体:")
    for model, variants in variant_analysis['model_variants'].items():
        print(f"{model}: {', '.join(variants)}")
    
    # 优化数据结构
    optimized_data = optimize_bike_data(bikes_data)
    
    # 保存优化后的数据
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(optimized_data, f, ensure_ascii=False, indent=4)
    
    print(f"\n优化后的数据已保存到 {output_file}")
    print(f"原始数据条目数: {len(bikes_data)}")
    print(f"优化后数据条目数: {len(optimized_data)}")

if __name__ == "__main__":
    main()
---
title: "实用工具"
description: "沼液还田实用计算工具"
layout: "single"
---

## 沼液用量计算器

输入您的种植面积，自动计算所需沼液量。

<div id="calculator" style="background: #f8faf9; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #e5e7eb;">
  <div style="margin-bottom: 16px;">
    <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #0d3b2e;">种植面积（亩）</label>
    <input type="number" id="area" placeholder="请输入面积" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
  </div>
  <div style="margin-bottom: 16px;">
    <label style="display: block; font-weight: 600; margin-bottom: 6px; color: #0d3b2e;">施用次数（每季）</label>
    <select id="times" style="width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
      <option value="2" selected>2 次（推荐）</option>
      <option value="3">3 次</option>
    </select>
  </div>
  <button onclick="calculate()" style="width: 100%; background: #0d3b2e; color: white; padding: 12px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600;">计算</button>
  <div id="result" style="margin-top: 16px; display: none; background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px;">
  </div>
</div>

<script>
function calculate() {
    const area = parseFloat(document.getElementById('area').value);
    const times = parseInt(document.getElementById('times').value);
    if (!area || area <= 0) {
        alert('请输入有效的种植面积');
        return;
    }
    const perTime = area * 20;
    const total = perTime * times;
    const nitrogen = area * 8 * times;
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').innerHTML = `
        <div style="font-weight: 700; color: #0d3b2e; font-size: 1.1em; margin-bottom: 8px;">📊 计算结果</div>
        <div style="color: #374151; line-height: 1.8;">
            <div>▸ 单次用量：<strong>${perTime} 吨</strong>（每亩 20 吨 × ${area} 亩）</div>
            <div>▸ 全季总用量：<strong>${total} 吨</strong>（${perTime} 吨 × ${times} 次）</div>
            <div>▸ 全季纯氮投入：<strong>${nitrogen} 公斤</strong>（每亩每次约 8 公斤）</div>
        </div>
        <div style="margin-top: 10px; font-size: 0.85em; color: #6b7280;">
            ⚠️ 以上为理论计算值，实际用量请结合土壤状况和作物长势调整。
        </div>
    `;
}
</script>

## 沼液安全检测标准速查表

沼液施用前必须检测以下指标，确保符合国家安全标准：

| 检测项目 | 安全限值 | 说明 |
| :--- | :---: | :--- |
| 铅 (Pb) | ≤ 0.3 mg/L | 重金属，影响作物品质 |
| 镉 (Cd) | ≤ 0.01 mg/L | 高毒性重金属 |
| 铬 (Cr) | ≤ 1.0 mg/L | 六价铬毒性更强 |
| 砷 (As) | ≤ 0.1 mg/L | 剧毒，必须严格把控 |
| 汞 (Hg) | ≤ 0.001 mg/L | 极微量即有害 |
| pH | 6.5 - 8.5 | 过酸过碱均不利 |
| 蛔虫卵 | ≤ 0.01 个/L | 病原菌指标 |

> ⚠️ **提醒：** 务必使用规范化养殖场经过充分厌氧发酵的沼液，使用前建议送检。

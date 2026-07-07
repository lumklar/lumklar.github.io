const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'src/favicon.svg'); // 修改为你的 SVG 实际路径
const outputDir = path.join(__dirname, 'dist'); // 放到压缩目录，会被自动复制
const outputIco = path.join(outputDir, 'favicon.ico');

(async () => {
    try {
        // 读取 SVG
        const svgBuffer = fs.readFileSync(svgPath);

        // 生成多个尺寸的 PNG（favicon 常见尺寸）
        const sizes = [16, 32, 48, 64];
        const pngBuffers = await Promise.all(
            sizes.map(size =>
                sharp(svgBuffer)
                    .resize(size, size)
                    .png()
                    .toBuffer()
            )
        );

        // 合并为 ICO
        const icoBuffer = await toIco(pngBuffers);

        // 确保输出目录存在
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputIco, icoBuffer);
        console.log(`✅ favicon.ico 已生成: ${outputIco}`);
    } catch (err) {
        console.error('❌ 生成 favicon.ico 失败:', err);
        process.exit(1);
    }
})();
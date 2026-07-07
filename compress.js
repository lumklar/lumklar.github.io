const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

// 配置
const srcDir = path.resolve(__dirname, 'src');
const outDir = path.resolve(__dirname, 'dist');

// 清理并创建输出目录
if (fs.existsSync(outDir)) fs.rmSync(outDir, {recursive: true, force: true});
fs.mkdirSync(outDir, {recursive: true});

// 递归遍历 src 目录
function walkDir(currentPath, relativePath = '') {
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const relPath = path.join(relativePath, item);
        if (fs.statSync(fullPath).isDirectory()) {
            fs.mkdirSync(path.join(outDir, relPath), {recursive: true});
            walkDir(fullPath, relPath);
        } else {
            compressFile(fullPath, relPath);
        }
    }
}

function compressFile(filePath, relPath) {
    const ext = path.extname(filePath).toLowerCase();
    const outFilePath = path.join(outDir, relPath);
    const content = fs.readFileSync(filePath, 'utf8');

    let result;
    try {
        switch (ext) {
            case '.html':
            case '.htm':
                // 使用 html-minifier
                result = execSync(
                    `npx html-minifier-terser --collapse-whitespace --remove-comments --minify-js true --minify-css true`,
                    {input: content, encoding: 'utf8'}
                );
                break;
            case '.js':
                // 使用 terser
                result = execSync(
                    `npx terser --compress --mangle`,
                    {input: content, encoding: 'utf8'}
                );
                break;
            case '.css':
                // 使用 clean-css-cli
                result = execSync(
                    `npx cleancss`,
                    {input: content, encoding: 'utf8'}
                );
                break;
            default:
                // 其他文件（图片等）原样复制
                fs.copyFileSync(filePath, outFilePath);
                return;
        }
        fs.writeFileSync(outFilePath, result, 'utf8');
        console.log(`✅ Compressed: ${relPath}`);
    } catch (err) {
        console.error(`❌ Failed to compress ${relPath}:`, err.message);
        // 出错时回退到原文件
        fs.copyFileSync(filePath, outFilePath);
    }
}

walkDir(srcDir);
console.log('🎉 Compression complete!');
GitHub Pages 手机端优化代码更新
===============================

把本目录内的文件上传到 GitHub 仓库根目录，覆盖同名文件：

- index.html
- styles.css
- script.js
- manifest.webmanifest
- sw.js

本更新不包含产品图片。请保留仓库里已有的这些目录：

- assets/brand/splash-cover.jpg 或 assets/brand/splash.jpg
- assets/products_1/SZ-001.jpg 至 SZ-100.jpg
- assets/products_2/SZ-101.jpg 至 SZ-151.jpg
- assets/catalog/pages/page-01.jpg 至 page-12.jpg

主要优化：

- 手机首页图片使用 object-fit: contain，完整显示，不再裁切。
- 产品列表首屏只渲染 24 个型号，点击“继续显示更多型号”再追加。
- 搜索仍然匹配全部 151 个型号。
- 点击产品只更新详情区，不再重建整张产品列表。
- sw.js 会清理旧缓存，降低手机端继续读取旧版本的概率。

更新后访问：

https://2436-yyyyyj.github.io/SZJZ.github.io/?v=20260618

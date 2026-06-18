GitHub Pages 手机端优化代码更新
===============================

把本目录内的文件上传到 GitHub 仓库根目录，覆盖同名文件：

- index.html
- styles.css
- script.js
- manifest.webmanifest
- sw.js
- assets/brand/splash-cover.jpg
- assets/brand/splash.jpg

本更新不包含产品图。请保留仓库里已有的这些目录：

- assets/products_1/SZ-001.jpg 至 SZ-100.jpg
- assets/products_2/SZ-101.jpg 至 SZ-151.jpg

主要优化：

- 封面海报已压缩为 720×1280 JPG，单张约 277KB。
- 手机首页图片使用 object-fit: contain，完整显示，不再裁切。
- 产品列表首屏只渲染 24 个型号，点击“继续显示更多型号”再追加。
- 首屏 24 张产品图使用 eager 加载，进入后优先显示产品图。
- 搜索仍然匹配全部 151 个型号。
- 点击产品只更新详情区，不再重建整张产品列表。
- 已删除原图册区域和原图册弹窗，不再加载 page-01 至 page-12 大图。
- sw.js 会清理旧缓存，降低手机端继续读取旧版本的概率。

更新后访问：

https://2436-yyyyyj.github.io/SZJZ.github.io/?v=20260618-final

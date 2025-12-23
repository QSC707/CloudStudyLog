# CloudVerify 云资源技术演示站

一个用于展示云原生架构的技术演示网站，演示了对象存储（OBS）和分布式缓存（Redis）在实际 Web 应用中的使用场景。

## 功能特性

- **仪表盘** - 实时访问统计和数据分析
- **学习资源库** - 技术文章、代码示例和视频教程
- **项目说明** - 技术架构和项目背景介绍

## 技术栈

- React 18
- Vite
- Tailwind CSS
- Lucide Icons

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看网站

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
├── src/
│   ├── App.jsx          # 主应用组件
│   ├── main.jsx         # 应用入口
│   └── index.css        # 全局样式
├── index.html           # HTML 模板
├── package.json         # 项目配置
└── vite.config.js       # Vite 配置
```

## 说明

本项目是一个技术学习和演示项目，用于展示现代 Web 应用如何集成云服务。

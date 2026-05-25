# 天气查询 · Weather

现代化天气查询应用。A modern weather app built with React + TypeScript + Vite + Tailwind CSS.

https://weather-phi-puce.vercel.app

## 功能 · Features

- 城市天气搜索（支持中文）· City search with Chinese support
- 当前天气：温度、体感、湿度、风速风向、气压 · Current weather: temp, feels-like, humidity, wind, pressure
- 5 天预报 + 日出日落 · 5-day forecast + sunrise/sunset
- 逐小时预报（24h，含降水量）· 24-hour forecast with precipitation
- 空气质量 AQI（PM2.5 / PM10 / O₃）· Air quality index
- 浏览器自动定位 · Browser geolocation
- 城市收藏（LocalStorage 持久化）· Favorite cities
- 最近搜索历史（单项可移除）· Recent searches with individual removal
- 多城市对比 · Multi-city comparison
- 分享天气（Web Share API / 剪贴板）· Share weather
- 深色 / 浅色 / 跟随系统主题 · Dark / light / system theme
- °C/°F + m/s/km/h 单位切换 · Unit toggles
- 玻璃态 UI + Framer Motion 动画 · Glassmorphism UI + animations
- PWA 可安装到桌面 · Installable PWA
- 搜索建议下拉 + `/` 键快捷键 · Search suggestions + `/` shortcut
- 小时内缓存免重复请求 · Same-hour cache

## 技术栈 · Stack

| 层 Layer | 技术 Tech |
|-----------|-----------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS 4 + 玻璃态 |
| 状态管理 | Zustand + persist |
| 动画 | Framer Motion |
| API | Open-Meteo（免费 free）+ OpenWeatherMap（可选 optional） |
| 测试 | Vitest + @testing-library/react |
| 部署 | Vercel |

## 本地运行 · Dev

```bash
npm install
cp .env.example .env.local
npm run dev
```

默认使用 Open-Meteo（免费无需 API Key）。

## 测试 · Test

```bash
npm test
```

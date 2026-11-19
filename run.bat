@echo off
chcp 65001 >nul
REM 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
REM 一键启动后端服务（端口 8111），并自动安装依赖
title 徐欣烨 - 科技资讯图文展示平台

cd /d "%~dp0backend"

if not exist "node_modules" (
  echo [Cheney] 未检测到依赖，开始安装……
  where cnpm >nul 2>nul
  if %errorlevel%==0 (
    call cnpm install
  ) else (
    call npm install
  )
)

echo [Cheney] 正在启动服务：http://localhost:8111
node app.js

pause

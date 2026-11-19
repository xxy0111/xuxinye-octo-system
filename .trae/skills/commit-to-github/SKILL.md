---
name: commit-to-github
description: 将本项目改动提交并推送到 GitHub 仓库 xxy0111/xuxinye-octo-system。当用户要求提交、commit、push、推送到 GitHub、同步远程仓库或备份到仓库时使用。仅用于本项目，不用于其他仓库或非 git 任务。
---

# 提交到 GitHub

项目根目录：`D:\高级网页设计案例\徐欣烨`
远程仓库：`git@github.com:xxy0111/xuxinye-octo-system.git`（SSH，公钥已配置）
默认分支：`master`

## 执行步骤

1. 确认当前目录是项目根目录（存在 `AGENTS.md` 与 `backend/app.js`），否则先 `cd` 到该目录。
2. 检查远程与分支：

```powershell
git remote -v
git status -sb
```

- 远程地址若不是 `git@github.com:xxy0111/xuxinye-octo-system.git`，用 `git remote set-url origin git@github.com:xxy0111/xuxinye-octo-system.git` 修正。
- 若报 `Repository not found`，优先怀疑账号拼写：正确用户名是 `xxy0111`，不是 `0xy0111`。

3. 暂存全部改动：

```powershell
git add -A
git status --short
```

确认暂存区中**没有** `.env` 与 `node_modules/`。若出现，说明 `.gitignore` 被破坏，先修复 `.gitignore` 再继续。

4. 提交。用一句话概括本次改动，遵循 `类型: 说明` 格式，类型取 `feat`、`fix`、`docs`、`style`、`refactor`、`chore`：

```powershell
git commit -m "feat: 一句话说明本次改动"
```

若输出 `nothing to commit, working tree clean`，跳过提交，直接进入第 5 步。

5. 推送并确认：

```powershell
git push origin master
git status -sb
```

推送成功的标志是出现 `master -> master`，且最后状态显示 `## master...origin/master` 没有 `[ahead N]`。

## 报告

向用户说明：提交哈希、提交说明、推送结果、远程仓库链接 `https://github.com/xxy0111/xuxinye-octo-system`。

## 禁止

- 不要使用 `git push --force`，不要改写已推送的历史。
- 不要提交 `.env`、`node_modules/`、`backend/node_modules/`。
- 不要在未确认改动内容时批量执行 `git add -A` 之外的操作（如 `git reset --hard`）。

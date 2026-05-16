# AGENTS.md - 云帆 Pro 开发规则

## 唯一正确工作目录

**唯一合法开发目录：**
```
/Users/chensan/Library/CloudStorage/OneDrive-个人/Mac 资料/YunfanV2
```
- `~/yunfan-pro-dev` 是软链接，指向此目录
- 所有代码操作都在这个目录下
- **禁止在 Accio 目录进行任何开发工作**

---

## Git 安全规则（防丢失代码）

### 每次 session 开始时
```
git add . && git commit -m "wip: [功能名]"
```
做到一半的文件也要 commit，丢了能从 git 恢复。

### 操作 git 前必查
```
git status --short
```
看有没有 `??`（未跟踪文件）和 `M`（未提交修改），有的话先 commit 再操作。

### 永远禁止
```
git checkout HEAD -- <file>
git reset --hard
```
这两个命令会强制覆盖本地修改，是最危险的。改用 `git stash` 或直接 commit。

### pull 前必 commit
```bash
git commit -m "wip"  # 先存
git pull --rebase    # 再拉
```

### 危险操作前强制检查
任何涉及 git 的操作（pull / checkout / reset / merge）**执行前自动运行 `git status --short`**，确保无未提交文件。

---

## 代码交付规则

1. 所有代码改动写进 `CHANGELOG.md`
2. 功能完成后立即 `git add . && git commit`
3. 不留未提交的本地修改过夜

---

## 审批规则

任何涉及用户系统的操作（执行脚本、修改文件、部署服务、写入数据库）必须先汇报方案，等用户确认后才执行。

查询、读文件、计算类行为不需要汇报。
## 🛡️ Git 安全规则（防丢失代码）

### 每次 session 开始时
```bash
git add . && git commit -m "wip"
```
把当前状态锁住，丢了能从 git 恢复。

### 完成任何小功能后
```bash
git add <文件> && git commit -m "feat: 功能名"
```
不要等到"全部完成再commit"，不知道什么时候会出事。

### 操作 git 前必查
```bash
git status --short
```
有 `??`（未跟踪）或 `M`（修改）→ 先 commit 再操作。

### 永远禁止
```
git checkout HEAD -- <file>
git reset --hard
```
用 `git stash` 代替 stash 可恢复，checkout 无法还原。

### 危险操作前自动检查
任何 git pull / checkout / reset / merge 前，自动执行 `git status --short`。

### push 前必 commit
```bash
git commit -m "wip"  # 先存
git pull --rebase    # 再拉
```

### 代码交付规则
1. 所有代码改动写进 `CHANGELOG.md`
2. 功能完成后立即 `git add . && git commit`
3. **不留未提交的本地修改过夜**

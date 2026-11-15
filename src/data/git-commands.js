export const gitCommandCategories = [
  { key: 'basic', label: '基础操作' },
  { key: 'branch', label: '分支协作' },
  { key: 'history', label: '日志与追踪' },
  { key: 'undo', label: '撤销与恢复' },
  { key: 'remote', label: '远程仓库' },
  { key: 'advanced', label: '进阶常用' }
]

export const gitCommands = [
  {
    id: 'git-init',
    title: '初始化仓库',
    category: 'basic',
    command: 'git init',
    summary: '把当前目录初始化为 Git 仓库。',
    scenario: ['新项目初始化', '本地代码纳管'],
    example: 'git init',
    outputTips: ['初始化后通常还需要设置 .gitignore 和首次提交。'],
    aliases: ['初始化', 'new repo']
  },
  {
    id: 'git-clone',
    title: '克隆仓库',
    category: 'basic',
    command: 'git clone <repo-url>',
    summary: '从远程仓库拉取一份完整副本。',
    scenario: ['拉项目', '接手已有仓库'],
    example: 'git clone https://github.com/user/repo.git',
    outputTips: ['可加目录名作为目标路径。'],
    aliases: ['clone', '复制仓库']
  },
  {
    id: 'git-status',
    title: '查看工作区状态',
    category: 'basic',
    command: 'git status',
    summary: '查看工作区、暂存区、当前分支状态。',
    scenario: ['提交前检查', '确认改动'],
    example: 'git status',
    outputTips: ['先看 untracked、modified、staged。'],
    aliases: ['状态']
  },
  {
    id: 'git-add',
    title: '暂存文件',
    category: 'basic',
    command: 'git add <file>',
    summary: '把工作区改动加入暂存区。',
    scenario: ['准备提交', '部分文件提交'],
    example: 'git add src/main.js',
    outputTips: ['git add . 会把当前目录下所有改动一起暂存。'],
    aliases: ['暂存']
  },
  {
    id: 'git-commit',
    title: '提交改动',
    category: 'basic',
    command: 'git commit -m "<message>"',
    summary: '把暂存区内容提交为一个快照。',
    scenario: ['功能开发完成', '修复提交'],
    example: 'git commit -m "fix: handle login timeout"',
    outputTips: ['提交信息建议带动词和范围。'],
    aliases: ['提交']
  },
  {
    id: 'git-switch',
    title: '切换分支',
    category: 'branch',
    command: 'git switch <branch>',
    summary: '切到已有分支，或结合 -c 新建并切换。',
    scenario: ['切功能分支', '回主干'],
    example: 'git switch -c feature/user-profile',
    outputTips: ['新分支推荐用 switch -c，比 checkout 更清晰。'],
    aliases: ['切换分支']
  },
  {
    id: 'git-branch',
    title: '查看和管理分支',
    category: 'branch',
    command: 'git branch -vv',
    summary: '查看本地分支、跟踪关系和最新提交。',
    scenario: ['整理分支', '查看跟踪关系'],
    example: 'git branch -vv',
    outputTips: ['-d 删除已合并分支，-D 强制删除。'],
    aliases: ['branch']
  },
  {
    id: 'git-merge',
    title: '合并分支',
    category: 'branch',
    command: 'git merge <branch>',
    summary: '把目标分支合并到当前分支。',
    scenario: ['合并功能分支', '同步主干'],
    example: 'git merge main',
    outputTips: ['出现冲突时先解决冲突再提交 merge。'],
    aliases: ['merge', '合并']
  },
  {
    id: 'git-rebase',
    title: '变基',
    category: 'branch',
    command: 'git rebase <branch>',
    summary: '把当前分支提交重新接到目标分支之后，保持历史更线性。',
    scenario: ['同步主干', '整理提交历史'],
    example: 'git rebase main',
    outputTips: ['冲突解决后执行 git rebase --continue。'],
    caution: ['已经共享给他人的提交不要随意 rebase 后强推。'],
    aliases: ['rebase', '变基']
  },
  {
    id: 'git-log',
    title: '查看提交日志',
    category: 'history',
    command: 'git log --oneline --graph --decorate -20',
    summary: '查看最近提交、分支指向和历史结构。',
    scenario: ['查提交', '看分支关系'],
    example: 'git log --oneline --graph --decorate -20',
    outputTips: ['这是最常用的日志查看组合。'],
    aliases: ['log', '历史']
  },
  {
    id: 'git-diff',
    title: '查看差异',
    category: 'history',
    command: 'git diff',
    summary: '查看工作区与暂存区/版本间的差异。',
    scenario: ['提交前检查', '对比修改'],
    example: 'git diff --staged',
    outputTips: ['git diff 看未暂存，git diff --staged 看已暂存。'],
    aliases: ['diff', '比较']
  },
  {
    id: 'git-blame',
    title: '追踪代码责任',
    category: 'history',
    command: 'git blame <file>',
    summary: '按行查看文件最后一次修改者和提交。',
    scenario: ['定位责任提交', '查历史修改'],
    example: 'git blame src/App.vue',
    outputTips: ['适合追某一行是谁在什么提交里改的。'],
    aliases: ['blame']
  },
  {
    id: 'git-restore-file',
    title: '丢弃工作区改动',
    category: 'undo',
    command: 'git restore <file>',
    summary: '恢复工作区文件到当前 HEAD 状态。',
    scenario: ['撤销单文件修改', '回退误改'],
    example: 'git restore src/App.vue',
    caution: ['会丢失当前文件未提交改动。'],
    aliases: ['恢复文件']
  },
  {
    id: 'git-restore-staged',
    title: '撤销暂存',
    category: 'undo',
    command: 'git restore --staged <file>',
    summary: '把文件从暂存区移回工作区。',
    scenario: ['取消暂存', '重新整理提交'],
    example: 'git restore --staged src/App.vue',
    aliases: ['unstage']
  },
  {
    id: 'git-reset-soft',
    title: '回退提交保留改动',
    category: 'undo',
    command: 'git reset --soft HEAD~1',
    summary: '撤销最近一次提交，但保留改动在暂存区。',
    scenario: ['改错 commit message', '重新整理提交'],
    example: 'git reset --soft HEAD~1',
    caution: ['已推送的提交回退前先确认协作影响。'],
    aliases: ['soft reset']
  },
  {
    id: 'git-reset-mixed',
    title: '回退提交并取消暂存',
    category: 'undo',
    command: 'git reset HEAD~1',
    summary: '撤销最近一次提交，改动回到工作区。',
    scenario: ['提交拆分', '重新暂存'],
    example: 'git reset HEAD~1',
    aliases: ['mixed reset']
  },
  {
    id: 'git-revert',
    title: '生成反向提交',
    category: 'undo',
    command: 'git revert <commit>',
    summary: '用一个新提交撤销历史提交，适合已共享历史。',
    scenario: ['撤销线上提交', '团队协作安全回退'],
    example: 'git revert a1b2c3d',
    outputTips: ['这是团队协作里更安全的回退方式。'],
    aliases: ['反向提交']
  },
  {
    id: 'git-remote-v',
    title: '查看远程仓库',
    category: 'remote',
    command: 'git remote -v',
    summary: '查看当前仓库绑定的远程地址。',
    scenario: ['确认 origin', '排查 push 目标'],
    example: 'git remote -v',
    aliases: ['origin']
  },
  {
    id: 'git-fetch',
    title: '拉取远程更新但不合并',
    category: 'remote',
    command: 'git fetch origin',
    summary: '获取远程最新提交到本地，不直接改当前分支。',
    scenario: ['同步远程信息', '准备对比'],
    example: 'git fetch origin',
    outputTips: ['fetch 后再决定 merge 还是 rebase。'],
    aliases: ['fetch']
  },
  {
    id: 'git-pull',
    title: '拉取并合并',
    category: 'remote',
    command: 'git pull --rebase origin main',
    summary: '从远程拉取并合并或变基到当前分支。',
    scenario: ['同步主干', '更新本地分支'],
    example: 'git pull --rebase origin main',
    outputTips: ['团队更偏向线性历史时常用 --rebase。'],
    aliases: ['pull']
  },
  {
    id: 'git-push',
    title: '推送到远程',
    category: 'remote',
    command: 'git push origin <branch>',
    summary: '把本地分支提交推送到远程仓库。',
    scenario: ['提交代码', '发布协作分支'],
    example: 'git push origin feature/user-profile',
    aliases: ['push']
  },
  {
    id: 'git-stash',
    title: '临时保存改动',
    category: 'advanced',
    command: 'git stash push -m "<message>"',
    summary: '把当前未提交改动暂存起来，稍后恢复。',
    scenario: ['临时切分支', '处理中断任务'],
    example: 'git stash push -m "wip login bugfix"',
    outputTips: ['恢复可用 git stash pop 或 git stash apply。'],
    aliases: ['stash']
  },
  {
    id: 'git-cherry-pick',
    title: '挑选提交',
    category: 'advanced',
    command: 'git cherry-pick <commit>',
    summary: '把指定提交拣到当前分支。',
    scenario: ['补丁迁移', '跨分支带提交'],
    example: 'git cherry-pick a1b2c3d',
    aliases: ['cherry-pick']
  },
  {
    id: 'git-tag',
    title: '创建标签',
    category: 'advanced',
    command: 'git tag -a v1.0.0 -m "release v1.0.0"',
    summary: '给某个提交打版本标签。',
    scenario: ['版本发布', '里程碑标记'],
    example: 'git tag -a v1.0.0 -m "release v1.0.0"',
    outputTips: ['推送标签用 git push origin --tags。'],
    aliases: ['tag', '版本']
  },
  {
    id: 'git-clean',
    title: '清理未跟踪文件',
    category: 'advanced',
    command: 'git clean -fd',
    summary: '删除未跟踪文件和目录。',
    scenario: ['清理构建产物', '恢复干净工作区'],
    example: 'git clean -fd',
    caution: ['会删除未跟踪文件，执行前先用 git clean -fdn 预览。'],
    aliases: ['clean']
  }
]

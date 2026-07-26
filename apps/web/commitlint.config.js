/**
 * Commitlint 提交信息规范配置
 * 基于 Conventional Commits 规范
 * @see https://www.conventionalcommits.org/
 *
 * 格式: <type>(<scope>): <subject>
 * 示例: feat(auth): 添加第三方登录
 *
 * type: 主要类型
 * scope: 涉及范围（可选）
 * subject: 简短描述
 */

/** @type {import('commitlint').Config} */
const config = {
  // 继承 Conventional Commits 规则
  extends: ['@commitlint/config-conventional'],

  // 自定义规则
  rules: {
    // 类型必须为以下之一
    'type-enum': [
      2,
      'always',
      [
        // feat: 添加新功能
        // 示例: feat(auth): 添加微信登录
        'feat',

        // fix: 修复bug
        // 示例: fix(comment): 修复评论提交后不显示的bug
        'fix',

        // docs: 更新文档
        // 示例: docs: 更新 API 文档
        //       docs(readme): 添加项目说明
        'docs',

        // style: 代码格式调整（不影响代码含义）
        // 示例: style: 统一代码缩进为 2 空格
        //       style(css): 格式化样式文件
        'style',

        // refactor: 重构（既不是修复bug也不是添加功能）
        // 示例: refactor(api): 抽取重复逻辑为工具函数
        'refactor',

        // perf: 性能优化
        // 示例: perf(list): 优化大数据列表渲染性能
        'perf',

        // test: 添加或修改测试
        // 示例: test: 添加单元测试覆盖率
        //       test(auth): 添加登录流程测试用例
        'test',

        // build: 构建系统或外部依赖变更
        // 示例: build: 升级 webpack 到 5.0
        //       build(docker): 更新 Dockerfile 配置
        //       build(ci): 修复 GitHub Actions 构建脚本
        'build',

        // ci: CI 配置变更
        // 示例: ci: 添加 GitHub Actions 自动化部署
        //       ci: 优化 CI 缓存策略
        'ci',

        // chore: 其他杂项，不涉及代码
        // 示例: chore: 更新依赖版本
        //       chore: 添加 .gitignore 规则
        //       chore: 清理注释代码
        'chore',

        // revert: 回滚之前的提交
        // 示例: revert: 回滚 "feat(auth): 添加微信登录"
        'revert',
      ],
    ],

    // type 必须为小写
    'type-case': [2, 'always', 'lower-case'],

    // type 不能为空
    'type-empty': [2, 'never'],

    // 提交信息主体不能为空
    'subject-empty': [2, 'never'],

    // subject 大小写不敏感
    'subject-case': [0],
  },
}

export default config

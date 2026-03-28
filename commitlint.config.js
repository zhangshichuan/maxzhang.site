/**
 * Commitlint 提交信息规范配置
 * 基于 Conventional Commits 规范
 * @see https://www.conventionalcommits.org/
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
				'feat', // 添加新功能
				'fix', // 修复bug
				'docs', // 更新文档
				'style', // 代码格式调整（不影响代码含义的变更）
				'refactor', // 重构（既不是修复bug也不是添加功能的代码变更）
				'perf', // 性能优化
				'test', // 添加或修改测试
				'build', // 构建系统或外部依赖变更
				'ci', // CI 配置变更
				'chore', // 构建/工具/其他变更
				'revert', // 回滚之前的提交
			],
		],

		// type 大小写不敏感
		'type-case': [2, 'always', 'lower-case'],

		// type 不能为空
		'type-empty': [2, 'never'],

		// 提交信息主体不能为空
		'subject-empty': [2, 'never'],
	},
}

export default config

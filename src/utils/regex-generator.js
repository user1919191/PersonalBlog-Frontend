import { regexPresets } from './regex-presets'

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function detectCharType(char) {
  if (/\d/.test(char)) return 'digit'
  if (/[A-Z]/.test(char)) return 'upper'
  if (/[a-z]/.test(char)) return 'lower'
  if (/[\u4e00-\u9fa5]/.test(char)) return 'han'
  if (/\s/.test(char)) return 'whitespace'
  if (char === '_') return 'underscore'
  return 'literal'
}

function tokenizeSample(sample) {
  const tokens = []

  for (const char of Array.from(sample)) {
    const type = detectCharType(char)
    const last = tokens[tokens.length - 1]

    if (type === 'literal') {
      tokens.push({ type, value: char, min: 1, max: 1 })
      continue
    }

    if (last && last.type === type) {
      last.value += char
      last.min += 1
      last.max += 1
      continue
    }

    tokens.push({ type, value: char, min: 1, max: 1 })
  }

  return tokens
}

function generalizeType(current, next) {
  if (current === next) return current

  const pair = [current, next].sort().join(':')
  if (pair === 'lower:upper') return 'alpha'
  if (pair === 'alpha:lower' || pair === 'alpha:upper') return 'alpha'
  if (pair === 'alpha:digit' || pair === 'digit:lower' || pair === 'digit:upper') return 'alnum'
  if (pair === 'alnum:digit' || pair === 'alnum:lower' || pair === 'alnum:upper' || pair === 'alnum:alpha') return 'alnum'
  if (pair === 'literal:underscore') return 'word'
  if (pair === 'digit:underscore' || pair === 'lower:underscore' || pair === 'upper:underscore' || pair === 'alpha:underscore' || pair === 'alnum:underscore') return 'word'
  return 'mixed'
}

function mergeTokenGroups(groups) {
  const base = groups[0].map(token => ({ ...token }))

  for (let groupIndex = 1; groupIndex < groups.length; groupIndex += 1) {
    const current = groups[groupIndex]
    if (current.length !== base.length) return null

    for (let tokenIndex = 0; tokenIndex < base.length; tokenIndex += 1) {
      const source = base[tokenIndex]
      const target = current[tokenIndex]

      if (source.type === 'literal' || target.type === 'literal') {
        if (source.type !== target.type || source.value !== target.value) return null
        continue
      }

      source.type = generalizeType(source.type, target.type)
      source.min = Math.min(source.min, target.min)
      source.max = Math.max(source.max, target.max)
      if (source.type === 'mixed') return null
    }
  }

  return base
}

function buildQuantifier(min, max) {
  if (min === 1 && max === 1) return ''
  if (min === max) return `{${min}}`
  return `{${min},${max}}`
}

function tokenToPattern(token) {
  if (token.type === 'literal') return escapeRegex(token.value)

  const quantifier = buildQuantifier(token.min, token.max)
  const mapper = {
    digit: `\\d${quantifier}`,
    upper: `[A-Z]${quantifier}`,
    lower: `[a-z]${quantifier}`,
    alpha: `[A-Za-z]${quantifier}`,
    alnum: `[A-Za-z0-9]${quantifier}`,
    underscore: `_${quantifier}`,
    word: `\\w${quantifier}`,
    han: `[\\u4e00-\\u9fa5]${quantifier}`,
    whitespace: `\\s${quantifier}`
  }

  return mapper[token.type] || `.${quantifier || ''}`
}

function buildPatternFromSample(sample) {
  return `^${tokenizeSample(sample).map(tokenToPattern).join('')}$`
}

export function detectPreset(sample) {
  return regexPresets.find(item => {
    try {
      return new RegExp(item.pattern, item.flags).test(sample)
    } catch {
      return false
    }
  }) || null
}

export function generateRegexFromSample(sample) {
  const value = sample.trim()
  if (!value) {
    return { pattern: '', source: 'empty', description: '请输入样例字符串。' }
  }

  const preset = detectPreset(value)
  if (preset) {
    return {
      pattern: preset.pattern,
      flags: preset.flags,
      source: 'preset',
      title: preset.title,
      description: `已识别为常见模式：${preset.title}。`
    }
  }

  return {
    pattern: buildPatternFromSample(value),
    flags: '',
    source: 'derived',
    title: '样例推断',
    description: '根据当前样例的字符结构推断生成。'
  }
}

export function generateRegexFromSamples(samples) {
  const validSamples = samples.map(item => item.trim()).filter(Boolean)
  if (!validSamples.length) {
    return { pattern: '', flags: '', source: 'empty', description: '请输入至少一条样例。' }
  }

  if (validSamples.length === 1) return generateRegexFromSample(validSamples[0])

  const preset = regexPresets.find(item => {
    try {
      const regex = new RegExp(item.pattern, item.flags)
      return validSamples.every(sample => regex.test(sample))
    } catch {
      return false
    }
  })

  if (preset) {
    return {
      pattern: preset.pattern,
      flags: preset.flags,
      source: 'preset',
      title: preset.title,
      description: `多条样例都命中常见模式：${preset.title}。`
    }
  }

  const merged = mergeTokenGroups(validSamples.map(tokenizeSample))
  if (!merged) {
    return {
      pattern: buildPatternFromSample(validSamples[0]),
      flags: '',
      source: 'fallback',
      title: '首条样例推断',
      description: '多条样例结构差异较大，已回退为首条样例推断结果。'
    }
  }

  return {
    pattern: `^${merged.map(tokenToPattern).join('')}$`,
    flags: '',
    source: 'derived',
    title: '多样例推断',
    description: '根据多条样例的共同结构归纳生成。'
  }
}

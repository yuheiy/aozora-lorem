const { JSDOM } = require('jsdom')
const { flatten, sample, random } = require('lodash')

const ELEMENT_NODE = 1

const chunkBy = (array, predicate, options = {}) => {
  options = { ...{ includesSeparator: false }, ...options }
  let result = []
  ;[...array].forEach((value) => {
    if (predicate(value)) {
      if (options.includesSeparator) {
        result.push(value)
      }
      result.push([])
    } else {
      if (!Array.isArray(result[result.length - 1])) {
        result.push([])
      }
      result[result.length - 1].push(value)
    }
  })
  result = result.filter((value) => {
    return (
      (options.includesSeparator && predicate(value)) ||
      (Array.isArray(value) && value.length)
    )
  })

  return result
}

const isSeparetor = (node) => ['BR', 'DIV'].includes(node.nodeName)

const splitAsLines = (nodes) => {
  return chunkBy(nodes, isSeparetor, {
    includesSeparator: true,
  }).reduce((result, value) => {
    if (isSeparetor(value)) {
      return [...result, ...splitAsLines(value.childNodes)]
    } else {
      const nestedNodes = value.reduce((nestedNodes, node) => {
        if (node.nodeType === ELEMENT_NODE) {
          return ['IMG', 'RP', 'RT'].includes(node.nodeName)
            ? [...nestedNodes, node]
            : [...nestedNodes, ...flatten(splitAsLines(node.childNodes))]
        } else {
          return [...nestedNodes, node]
        }
      }, [])
      return [...result, nestedNodes]
    }
  }, [])
}

const loadBook = (url) => {
  return JSDOM.fromURL(url).then((dom) => {
    const { childNodes } = dom.window.document.querySelector('.main_text')
    const content = splitAsLines(childNodes)
      .map((nodes) => {
        return nodes
          .map((node) => {
            let text = ''
            switch (node.nodeName) {
              case 'IMG':
                text = node.alt
                break
              case 'RP':
              case 'RT':
                break
              default:
                text = node.textContent
                break
            }
            return text.trim()
          })
          .join('')
      })
      .filter(Boolean)

    const lorem = {
      paragraph: () => sample(content),
      paragraphs: (lines = random(1, content.length)) => {
        const start = random(0, content.length - lines)
        const end = start + lines
        return content.slice(start, end)
      },
    }

    return {
      content: [...content],
      lorem,
    }
  })
}

module.exports = {
  _chunkBy: chunkBy,
  _splitAsLines: splitAsLines,
  loadBook,
}

const { JSDOM } = require('jsdom')
const { _chunkBy, _splitAsLines, loadBook } = require('.')

test('_chunkBy', () => {
  const isSeparator = (val) => val === '/'
  ;[
    [['a', 'b', '/', 'c'], [['a', 'b'], ['c']], [['a', 'b'], '/', ['c']]],
    [['/', 'a'], [['a']], ['/', ['a']]],
    [['/', 'a', 'b'], [['a', 'b']], ['/', ['a', 'b']]],
    [['a', '/'], [['a']], [['a'], '/']],
    [['a', 'b', '/'], [['a', 'b']], [['a', 'b'], '/']],
    [['a'], [['a']], [['a']]],
    [['/'], [], ['/']],
  ].forEach(([input, expected1, expected2]) => {
    expect(_chunkBy(input, isSeparator)).toEqual(expected1)
    expect(_chunkBy(input, isSeparator, { includesSeparator: true })).toEqual(
      expected2,
    )
  })
})

test('_splitAsLines', () => {
  const node = (content) => JSDOM.fragment(content).firstChild
  ;[
    [
      `a<br>
b`,
      [
        [node('a')],
        [
          node(`
b`),
        ],
      ],
    ],
    [
      `<br>
<br>
a<br>
<br>
b<br>
<br>`,
      [
        [
          node(`
`),
        ],
        [
          node(`
a`),
        ],
        [
          node(`
`),
        ],
        [
          node(`
b`),
        ],
        [
          node(`
`),
        ],
      ],
    ],
    [
      `a<br>
b<em>c</em><br>
d`,
      [
        [node('a')],
        [
          node(`
b`),
          node('c'),
        ],
        [
          node(`
d`),
        ],
      ],
    ],
    [
      `a
<div>
b<br>
c<span>d</span><br>
e
</div>
f`,
      [
        [
          node(`a
`),
        ],
        [
          node(`
b`),
        ],
        [
          node(`
c`),
          node('d'),
        ],
        [
          node(`
e
`),
        ],
        [
          node(`
f`),
        ],
      ],
    ],
    [
      `激怒した。<br>
必ず、かの<ruby><rb>邪智暴虐</rb><rp>（</rp><rt>じゃちぼうぎゃく</rt><rp>）</rp></ruby>の王<br>
除かなければ<img src="" alt="ならぬと決意した。">`,
      [
        [node('激怒した。')],
        [
          node(`
必ず、かの`),
          node('邪智暴虐'),
          node('<rp>（</rp>'),
          node('<rt>じゃちぼうぎゃく</rt>'),
          node('<rp>）</rp>'),
          node('の王'),
        ],
        [
          node(`
除かなければ`),
          node('<img src="" alt="ならぬと決意した。">'),
        ],
      ],
    ],
  ].forEach(([html, expected]) => {
    expect(_splitAsLines(JSDOM.fragment(html).childNodes)).toEqual(expected)
  })
})

test('loadBook', () => {
  return Promise.all(
    [
      'https://www.aozora.gr.jp/cards/000081/files/45630_23908.html',
      'https://www.aozora.gr.jp/cards/000035/files/1567_14913.html',
      'https://www.aozora.gr.jp/cards/002010/files/59177_65096.html',
      'https://www.aozora.gr.jp/cards/000081/files/456_15050.html',
    ].map(loadBook),
  ).then((books) => {
    books.forEach((book) => {
      expect(book.content).toMatchSnapshot()
    })
  })
})

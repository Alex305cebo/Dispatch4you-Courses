# -*- coding: utf-8 -*-
"""Английская озвучка уроков: mp3 + VTT с пословными метками.

Зачем свой скрипт, а не edge-tts --write-subtitles: готовый ключ отдаёт SRT,
где реплика — сплошная строка. Плеер курса (lesson-audio.js, parseCue) ждёт
внутри реплики метки вида <00:00:01.200> перед каждым словом и по ним
подсвечивает слово в момент, когда оно звучит. Русские дорожки сделаны именно
так, поэтому английские собираем тем же форматом — иначе подсветка пропадёт.

Реплики режем по предложениям ИСХОДНОГО текста: события WordBoundary приходят
без знаков препинания, по ним границу фразы не найти. Идём по словам от синтеза
и накапливаем, пока накопленное не покроет очередное предложение.

Запуск:  python _tts_en.py audio/tts-texts/en/intro-section-1.txt audio/en
Не попадает на прод: *.py исключён в deploy.yml.
"""
import asyncio, io, os, re, sys
import edge_tts

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

VOICE = 'en-US-AndrewNeural'
RATE = '-4%'          # тот же неспешный темп, что у русских дорожек


def ts(sec):
    h = int(sec // 3600)
    m = int(sec % 3600 // 60)
    return '%02d:%02d:%06.3f' % (h, m, sec % 60)


def letters(s):
    return re.sub(r'[^0-9a-zA-Z]', '', s).lower()


def sentences(text):
    """Текст → предложения.

    Точка не всегда конец фразы: 11.27 и $1.004 — число, U.S. и D.O.T. —
    аббревиатура. И то и другое встречается в уроках, а разрез в неверном
    месте рвёт реплику посреди мысли.
    """
    text = re.sub(r'\s+', ' ', text.strip())
    parts, buf = [], ''
    for i, ch in enumerate(text):
        buf += ch
        if ch not in '.!?':
            continue
        nxt = text[i + 1] if i + 1 < len(text) else ' '
        prv = text[i - 1] if i else ' '
        if ch == '.':
            if prv.isdigit() and nxt.isdigit():
                continue                      # 11.27
            # «U.S.» — одиночная заглавная перед точкой, и до неё либо начало,
            # либо ещё одна такая же точка
            if prv.isupper() and (i < 2 or text[i - 2] in ' .'):
                continue
        if nxt == ' ' or i + 1 == len(text):
            if len(letters(buf)) > 1:
                parts.append(buf.strip())
                buf = ''
    if buf.strip():
        parts.append(buf.strip())
    return parts


async def build(src, outdir):
    name = os.path.splitext(os.path.basename(src))[0]
    text = open(src, encoding='utf-8').read()

    comm = edge_tts.Communicate(text, VOICE, boundary='WordBoundary', rate=RATE)
    words = []
    mp3 = os.path.join(outdir, name + '.mp3')
    os.makedirs(outdir, exist_ok=True)
    with open(mp3, 'wb') as f:
        async for ch in comm.stream():
            if ch['type'] == 'audio':
                f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                words.append((ch['offset'] / 1e7, ch['duration'] / 1e7, ch['text']))

    # Раскладываем слова синтеза по предложениям исходника
    cues, wi = [], 0
    for sent in sentences(text):
        want = letters(sent)
        got, group = '', []
        while wi < len(words) and len(got) < len(want):
            group.append(words[wi])
            got += letters(words[wi][2])
            wi += 1
        if group:
            cues.append(group)
    if wi < len(words):                        # хвост, если что-то не сошлось
        cues.append(words[wi:])

    out = ['WEBVTT', '']
    for i, cue in enumerate(cues, 1):
        line = cue[0][2]
        for w in cue[1:]:
            line += ' <' + ts(w[0]) + '>' + w[2]
        out += [str(i),
                '%s --> %s' % (ts(cue[0][0]), ts(cue[-1][0] + cue[-1][1])),
                line, '']
    vtt = os.path.join(outdir, name + '.vtt')
    open(vtt, 'w', encoding='utf-8', newline='\n').write('\n'.join(out))

    dur = words[-1][0] + words[-1][1] if words else 0
    print('  %-24s %5.1f сек | слов %3d | реплик %2d | %s КБ'
          % (name, dur, len(words), len(cues), os.path.getsize(mp3) // 1024))


async def main():
    srcs = sys.argv[1:-1]
    outdir = sys.argv[-1]
    for s in srcs:
        await build(s, outdir)


asyncio.run(main())

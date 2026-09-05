# -*- coding: utf-8 -*-
"""Переключает английские страницы уроков на английские дорожки.

Трогает только те <audio>, для которых английский файл уже лежит в audio/en/.
Если озвучки ещё нет — путь остаётся русским, страница продолжает работать.
Заодно ставит data-duration по реальной длине из VTT: в разметке стояла длина
русской дорожки, а английская отличается.

Субтитры подставлять не нужно: плеер (lesson-audio.js) сам берёт .vtt по имени
.mp3, поэтому достаточно поменять путь к звуку.

Запуск:  python _switch_en_audio.py
Не попадает на прод: *.py исключён в deploy.yml.
"""
import io, os, re, sys, glob

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


def vtt_len(path):
    """Длительность по последней метке конца реплики."""
    try:
        t = open(path, encoding='utf-8', errors='ignore').read()
    except OSError:
        return None
    m = re.findall(r'--> (\d\d):(\d\d):([\d.]+)', t)
    if not m:
        return None
    h, mi, s = m[-1]
    return int(round(int(h) * 3600 + int(mi) * 60 + float(s))) + 1


ready = {os.path.splitext(os.path.basename(f))[0] for f in glob.glob('audio/en/*.mp3')}
if not ready:
    print('в audio/en/ пока пусто'); sys.exit()

total = 0
for page in sorted(glob.glob('en/pages/*.html')):
    s = open(page, encoding='utf-8').read()
    orig = s
    switched = []

    def repl(m):
        head, name, tail = m.group(1), m.group(2), m.group(3)
        if name not in ready:
            return m.group(0)
        dur = vtt_len('audio/en/%s.vtt' % name)
        out = head + '/audio/en/' + name + '.mp3' + tail
        if dur:
            out = re.sub(r'data-duration="\d+"', 'data-duration="%d"' % dur, out)
        switched.append(name)
        return out

    s = re.sub(r'(<audio[^>]*?src=")/audio/([A-Za-z0-9._-]+)\.mp3("[^>]*>)', repl, s)
    if s != orig:
        open(page, 'w', encoding='utf-8', newline='').write(s)
        print('  %-34s %d дорожек: %s' % (os.path.basename(page), len(switched), ', '.join(switched)))
        total += len(switched)

print('переключено дорожек:', total)

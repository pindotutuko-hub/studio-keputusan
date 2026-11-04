# Buku panduan gaya "USER GUIDE" (mengikuti contoh lampiran HKI program komputer):
# Deskripsi → Spesifikasi → Tampilan → Cara membuka/pemasangan → Cara penggunaan (gambar kiri bertanda merah, penjelasan kanan)
# Pakai: python3 build2.py spec.json out.pdf
import json, sys, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether
from PIL import Image as PILImage, ImageDraw
from fontTools.ttLib import TTFont as _TT

F = '/usr/share/fonts/truetype/dejavu/'
for n, f in [('DV', 'DejaVuSans.ttf'), ('DVB', 'DejaVuSans-Bold.ttf'), ('DVI', 'DejaVuSans-Oblique.ttf')]: pdfmetrics.registerFont(TTFont(n, F + f))
pdfmetrics.registerFontFamily('DV', normal='DV', bold='DVB', italic='DVI', boldItalic='DVB')
_CM = _TT(F + 'DejaVuSans.ttf').getBestCmap()
def _clean(o):
    if isinstance(o, str): return ''.join(ch for ch in o if ord(ch) < 128 or ord(ch) in _CM)
    if isinstance(o, list): return [_clean(x) for x in o]
    if isinstance(o, dict): return {k: _clean(v) for k, v in o.items()}
    return o

spec = _clean(json.load(open(sys.argv[1], encoding='utf-8'))); out = sys.argv[2]; base = os.path.dirname(os.path.abspath(sys.argv[1]))
os.makedirs(os.path.join(base, '_hl'), exist_ok=True)
INK = colors.HexColor('#1b1b1b'); MUT = colors.HexColor('#555555'); LINE = colors.HexColor('#cfcfcf'); W, H = A4; M = 20 * mm; CW = W - 2 * M
st = {
 'title': ParagraphStyle('t', fontName='DVB', fontSize=17, leading=23, alignment=1, textColor=INK),
 'sub': ParagraphStyle('s', fontName='DVB', fontSize=13.5, leading=19, alignment=1, textColor=INK, spaceAfter=10),
 'h': ParagraphStyle('h', fontName='DVB', fontSize=14, leading=19, textColor=INK, spaceBefore=10, spaceAfter=6),
 'p': ParagraphStyle('p', fontName='DV', fontSize=10, leading=15, textColor=INK, alignment=4, spaceAfter=5),
 'b': ParagraphStyle('b', fontName='DV', fontSize=10, leading=15, textColor=INK, leftIndent=14, bulletIndent=4),
 'step': ParagraphStyle('st', fontName='DV', fontSize=10, leading=14.6, textColor=INK, alignment=0),
 'small': ParagraphStyle('sm', fontName='DV', fontSize=8.6, leading=12.2, textColor=INK, leftIndent=12, bulletIndent=2),
 'narr': ParagraphStyle('n', fontName='DVI', fontSize=8.9, leading=12.8, textColor=colors.HexColor('#333333'), alignment=4),
 'cap': ParagraphStyle('c', fontName='DVI', fontSize=8.2, leading=11, textColor=MUT, alignment=1),
}

def annotated(path, hl):
    """salin gambar dan beri tanda lingkaran/kotak merah (koordinat pecahan 0–1)"""
    src = os.path.join(base, path)
    if not hl: return src
    im = PILImage.open(src).convert('RGB'); w, h = im.size; d = ImageDraw.Draw(im); lw = max(4, w // 300)
    for r in hl:
        x0, y0, x1, y1 = r[0] * w, r[1] * h, r[2] * w, r[3] * h; pad = lw * 2
        box = [x0 - pad, y0 - pad, x1 + pad, y1 + pad]
        if len(r) > 4 and r[4] == 'o': d.ellipse(box, outline=(220, 30, 30), width=lw)
        else: d.rounded_rectangle(box, radius=lw * 3, outline=(220, 30, 30), width=lw)
    dst = os.path.join(base, '_hl', os.path.basename(path).rsplit('.', 1)[0] + '-' + str(abs(hash(json.dumps(hl))) % 10**6) + '.jpg')
    im.save(dst, quality=88); return dst

def img(path, maxw, maxh, hl=None):
    if hl == 'auto':
        f = os.path.join(base, path + '.hl.json'); hl = [b for b in json.load(open(f)) if b] if os.path.exists(f) else None
    p = annotated(path, hl); im = PILImage.open(p); w, h = im.size; s = min(maxw / w, maxh / h)
    i = Image(p, w * s, h * s); i.hAlign = 'CENTER'; return i

def framed(i):
    t = Table([[i]], colWidths=[i.drawWidth + 2]); t.setStyle(TableStyle([('BOX', (0, 0), (-1, -1), .5, LINE), ('LEFTPADDING', (0, 0), (-1, -1), 1), ('RIGHTPADDING', (0, 0), (-1, -1), 1), ('TOPPADDING', (0, 0), (-1, -1), 1), ('BOTTOMPADDING', (0, 0), (-1, -1), 1)]))
    return t

def footer(c, d):
    c.saveState(); c.setFont('DV', 7.8); c.setFillColor(MUT)
    c.drawString(M, 11 * mm, spec['title'].replace('\n', ' ') + ' — User Guide · Dibuat oleh Pindo Tutuko · ' + spec['url'])
    c.drawRightString(W - M, 11 * mm, str(d.page)); c.restoreState()

doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=M, rightMargin=M, topMargin=22 * mm, bottomMargin=20 * mm,
                        title=spec['title'].replace('\n', ' ') + ' — User Guide', author='Pindo Tutuko', subject=spec['subtitle'], creator='pindotutuko.id')
S = [Paragraph(spec['title'].replace('\n', ' '), st['title']), Paragraph('USER GUIDE', st['sub']),
     Paragraph(spec['subtitle'], ParagraphStyle('ss', parent=st['cap'], fontSize=9.5, leading=13, spaceAfter=8))]
S.append(Paragraph('Deskripsi Aplikasi', st['h']))
for p in spec['about']: S.append(Paragraph(p, st['p']))
S.append(Paragraph('Spesifikasi Aplikasi', st['h']))
S.append(Paragraph(spec.get('spec_intro', 'Untuk menjalankan aplikasi ' + spec['title'].replace('\n', ' ') + ', spesifikasi minimal perangkat adalah sebagai berikut:'), st['p']))
for b in spec['spec']: S.append(Paragraph(b, st['b'], bulletText='•'))
S.append(KeepTogether([Paragraph('Tampilan Aplikasi', st['h']), framed(img(spec['cover'], CW, 95 * mm)), Spacer(1, 2), Paragraph(spec.get('cover_cap', 'Tampilan utama aplikasi'), st['cap'])]))

def steps_table(steps, start=1, head=None):
    out = []
    for k, s in enumerate(steps, start):
        right = [Paragraph(f'{k}.&nbsp; ' + s['text'], st['step'])]
        if s.get('narr'): right += [Spacer(1, 4), Paragraph('<b>Maksudnya:</b> ' + s['narr'], st['narr'])]
        if s.get('img'):
            wide = s.get('wide', True)
            if wide:   # gambar lebar penuh di atas, penjelasan di bawah
                blk = [framed(img(s['img'], CW, s.get('maxh', 92) * mm, s.get('hl'))), Spacer(1, 4)] + right
            else:      # gambar kiri, penjelasan kanan (seperti contoh)
                i = framed(img(s['img'], CW * .5, s.get('maxh', 120) * mm, s.get('hl')))
                t = Table([[i, right]], colWidths=[CW * .52, CW * .48]); t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('LEFTPADDING', (1, 0), (1, 0), 10)]))
                blk = [t]
        else: blk = right
        if head is not None and k == start: blk = [head] + blk
        out.append(KeepTogether(blk))
        for pnt in s.get('points', []): out.append(Paragraph(pnt, st['small'], bulletText='–'))
        out.append(Spacer(1, 9))
    return out

S.append(PageBreak()); S.append(Paragraph(spec.get('install_title', 'Cara Membuka Aplikasi'), st['h']))
S += steps_table(spec['install'])
S.append(PageBreak()); S.append(Paragraph('Cara Penggunaan Aplikasi', st['h']))
if spec.get('usage_intro'): S.append(Paragraph(spec['usage_intro'], st['p']))
n = 1
for sec in spec['usage']:
    hd = Paragraph(sec['h'], ParagraphStyle('h3', parent=st['h'], fontSize=11.5, leading=15, spaceBefore=6)) if sec.get('h') else None
    S += steps_table(sec['steps'], n, hd); n += len(sec['steps'])
S.append(Paragraph('Sumber dan Kredit', st['h']))
for p in spec.get('credits', []): S.append(Paragraph(p, st['p']))
S.append(Paragraph('<b>Dibuat oleh Pindo Tutuko</b> — Universitas Merdeka Malang, Laboratorium Kota dan Permukiman. Panduan ini menggambarkan aplikasi ' + spec.get('version', '') + ' (' + spec.get('date', '') + ').', st['p']))
doc.build(S, onFirstPage=footer, onLaterPages=footer)
print('OK', out)

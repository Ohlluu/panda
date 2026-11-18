// Plain-text, bilingual newsletter authoring for the browser-local presentation demo.
export function createNewsletters({
  $,
  T,
  esc,
  icon,
  getState,
  save,
  render,
  openDialog,
  toast,
  getLanguage,
  todayKey,
  longDate,
  header,
  footer,
}) {
  let editor = null,
    editorLanguage = 'en',
    dirty = false,
    statusMessage = '';
  const covers = [
    ['none', () => T('No photo', 'Sin foto')],
    ['classroom', () => T('Story time', 'Hora del cuento')],
    ['learning', () => T('Learning together', 'Aprendiendo juntos')],
    ['child', () => T('Little artists', 'Pequeños artistas')],
  ];
  const copy = (value) => structuredClone(value);
  const image = (cover) =>
    covers.some((c) => c[0] === cover && cover !== 'none') ? `assets/${cover}.jpg` : null;
  const entries = () => getState().newsletters;
  const label = (entry) =>
    entry.content[getLanguage()].title ||
    entry.content.en.title ||
    entry.content.es.title ||
    T('Untitled newsletter', 'Boletín sin título');
  function startEditor(entry, discard = false) {
    if (entry && editor?.id === entry.id) return;
    if (dirty && !discard) {
      openDialog(
        `<h2>${T('Leave your unsaved changes?', '¿Salir sin guardar los cambios?')}</h2><p>${T('Save your draft first, or discard these edits to open another newsletter.', 'Guarda el borrador primero o descarta estos cambios para abrir otro boletín.')}</p><div class="dialog-actions"><button class="button outline" id="keep-editing">${T('Keep editing', 'Seguir editando')}</button><button class="button danger" id="discard-newsletter-edits">${T('Discard changes', 'Descartar cambios')}</button></div>`,
      );
      $('#keep-editing').onclick = () => $('#dialog').close();
      $('#discard-newsletter-edits').onclick = () => {
        $('#dialog').close();
        startEditor(entry, true);
      };
      return;
    }
    editor = entry
      ? copy(entry)
      : {
          id: crypto.randomUUID(),
          content: {
            en: { title: '', summary: '', body: '' },
            es: { title: '', summary: '', body: '' },
          },
          cover: 'none',
          published: null,
        };
    editorLanguage = getLanguage();
    dirty = false;
    statusMessage = '';
    render();
    $('#newsletter-title')?.focus();
  }
  function editionMarkup(edition, language = getLanguage()) {
    const content = edition.content[language];
    const picture = image(edition.cover);
    return `<article class="newsletter-edition">${picture ? `<img class="newsletter-cover" src="${picture}" alt="${T('Illustrative daycare stock photo', 'Foto de archivo ilustrativa de guardería')}">` : ''}<span class="hand-note">Little Panda ${T('family news', 'noticias para familias')}</span>${edition.date ? `<time datetime="${edition.date}">${longDate(edition.date, { month: 'long', day: 'numeric', year: 'numeric' })}</time>` : ''}<h1>${esc(content.title || T('Your newsletter title', 'El título de tu boletín'))}</h1>${content.summary ? `<p class="newsletter-summary">${esc(content.summary)}</p>` : ''}<div class="newsletter-body">${
      content.body
        ? content.body
            .split(/\n\s*\n/)
            .map((paragraph) => `<p>${esc(paragraph).replace(/\n/g, '<br>')}</p>`)
            .join('')
        : `<p>${T('Your story will appear here.', 'Tu historia aparecerá aquí.')}</p>`
    }</div></article>`;
  }
  function publicPage(id) {
    const published = entries()
      .filter((n) => n.published)
      .sort((a, b) => b.published.date.localeCompare(a.published.date));
    let main;
    if (id) {
      const newsletter = published.find((n) => n.id === id);
      main = `<a class="back-link" href="#/newsletters">← ${T('All newsletters', 'Todos los boletines')}</a>${newsletter ? editionMarkup(newsletter.published) : `<div class="empty-state"><h1>${T('This edition isn’t available.', 'Esta edición no está disponible.')}</h1><p>${T('Demo newsletters are available only in the browser where they were published.', 'Los boletines demo están disponibles solo en el navegador donde se publicaron.')}</p></div>`}`;
    } else {
      main = `<div class="sunny-section-title"><span class="hand-note">${T('A little news from our little world', 'Noticias de nuestro pequeño mundo')}</span><h1>${T('The Panda Post', 'El Boletín Panda')}</h1></div><div class="newsletter-public-grid">${
        published.length
          ? published
              .map((n) => {
                const edition = n.published,
                  c = edition.content[getLanguage()],
                  picture = image(edition.cover);
                return `<a class="newsletter-public-card" href="#/newsletters/${encodeURIComponent(n.id)}">${picture ? `<img src="${picture}" alt="" loading="lazy">` : `<div class="newsletter-no-cover">${icon('book')}</div>`}<div><time datetime="${edition.date}">${longDate(edition.date, { month: 'short', day: 'numeric', year: 'numeric' })}</time><h2>${esc(c.title)}</h2>${c.summary ? `<p>${esc(c.summary)}</p>` : ''}<span>${T('Read newsletter', 'Leer boletín')} ${icon('arrow')}</span></div></a>`;
              })
              .join('')
          : `<div class="empty-state">${icon('book')}<h2>${T('A little news is on its way.', 'Pronto tendremos noticias.')}</h2><p>${T('Our newsletters will appear here when published.', 'Nuestros boletines aparecerán aquí al publicarse.')}</p></div>`
      }</div>`;
    }
    return `${header()}<main id="main" class="container newsletters-public">${main}<p class="demo-note newsletter-local-note">${T('Website publishing demo · Newsletters are saved in this browser only. No emails are sent.', 'Demo de publicación web · Los boletines se guardan solo en este navegador. No se envían correos.')}</p></main>${footer()}`;
  }
  function adminPage() {
    const list = [...entries()].sort((a, b) =>
      (b.updatedAt || '').localeCompare(a.updatedAt || ''),
    );
    return `<section class="newsletter-toolbar"><div><strong>${list.filter((n) => n.published).length} ${T('published', 'publicados')}</strong><span> · ${list.filter((n) => !n.published).length} ${T('drafts', 'borradores')}</span></div><button class="button primary" id="new-newsletter"><span aria-hidden="true">+</span>${T('New newsletter', 'Nuevo boletín')}</button></section><div class="newsletter-workspace"><section class="admin-card newsletter-library"><div class="card-heading"><h2>${T('Your editions', 'Tus ediciones')}</h2></div>${list.length ? list.map((n) => `<div class="newsletter-library-item ${editor?.id === n.id ? 'selected' : ''}"><button data-edit-newsletter="${n.id}"><span class="status ${n.published ? 'confirmed' : 'draft'}">${n.published ? T('Published', 'Publicado') : T('Draft', 'Borrador')}</span><h3>${esc(label(n))}</h3><span class="edition-languages">EN + ES</span></button><div class="newsletter-row-actions">${n.published ? `<a href="#/newsletters/${n.id}">${T('View on website', 'Ver en el sitio')}</a><button class="text-button" data-unpublish-newsletter="${n.id}">${T('Unpublish', 'Retirar')}</button>` : ''}<button class="text-button" data-delete-newsletter="${n.id}">${T('Delete', 'Eliminar')}</button></div></div>`).join('') : `<div class="empty-state">${icon('book')}<p>${T('Start with a hello, a classroom update, or a note to families.', 'Empieza con un saludo, noticias del salón o una nota para las familias.')}</p></div>`}</section><section class="admin-card newsletter-editor-card">${editor ? editorMarkup() : `<div class="newsletter-editor-empty">${icon('book')}<h2>${T('A little story to share?', '¿Una historia para compartir?')}</h2><p>${T('Write in English and Spanish, preview your edition, then publish it to the demo website.', 'Escribe en inglés y español, revisa tu edición y publícala en el sitio de demostración.')}</p><button class="button outline" id="first-newsletter">${T('Write a newsletter', 'Escribir un boletín')}</button></div>`}</section></div><p class="demo-note newsletter-local-note">${T('Demo publishing is local to this browser. Save draft keeps the current published version unchanged; Publish updates the demo website. No emails are sent.', 'La publicación demo es local a este navegador. Guardar borrador conserva la versión publicada; Publicar actualiza el sitio demo. No se envían correos.')}</p>`;
  }
  function editorMarkup() {
    const c = editor.content[editorLanguage];
    return `<div class="card-heading"><div><h2>${T('Write your newsletter', 'Escribe tu boletín')}</h2><p id="newsletter-save-state" role="status">${statusMessage === 'published' ? T('Published to this browser’s demo website.', 'Publicado en el sitio demo de este navegador.') : statusMessage === 'saved-live' ? T('Draft saved. The published version stays unchanged.', 'Borrador guardado. La versión publicada no cambia.') : statusMessage === 'saved' ? T('Draft saved. Publish when ready.', 'Borrador guardado. Publícalo cuando esté listo.') : dirty ? T('Unsaved changes', 'Cambios sin guardar') : T('Write, save, and preview before publishing.', 'Escribe, guarda y revisa antes de publicar.')}</p></div></div><div class="newsletter-editor-tabs" role="group" aria-label="${T('Writing language', 'Idioma de redacción')}"><button data-editor-language="en" aria-pressed="${editorLanguage === 'en'}">English</button><button data-editor-language="es" aria-pressed="${editorLanguage === 'es'}">Español</button></div><form id="newsletter-form"><label for="newsletter-title">${T('Title', 'Título')} · ${editorLanguage === 'en' ? 'English' : 'Español'}</label><input id="newsletter-title" name="title" maxlength="120" value="${esc(c.title)}" placeholder="${editorLanguage === 'en' ? 'A little hello from Little Panda' : 'Un saludo de Little Panda'}"><label for="newsletter-summary">${T('Short introduction (optional)', 'Introducción breve (opcional)')}</label><textarea id="newsletter-summary" name="summary" rows="2" maxlength="300">${esc(c.summary)}</textarea><label for="newsletter-body">${T('Newsletter content', 'Contenido del boletín')} · ${editorLanguage === 'en' ? 'English' : 'Español'}</label><textarea id="newsletter-body" name="body" rows="10" maxlength="12000" placeholder="${editorLanguage === 'en' ? 'What would you like to share with families?' : '¿Qué quieres compartir con las familias?'}">${esc(c.body)}</textarea><p class="newsletter-help">${T('Separate paragraphs with a blank line. Add a title and content in both languages before publishing.', 'Separa los párrafos con una línea en blanco. Agrega título y contenido en ambos idiomas antes de publicar.')}</p><label for="newsletter-cover">${T('Cover photo', 'Foto de portada')}</label><select id="newsletter-cover" name="cover">${covers.map(([value, display]) => `<option value="${value}" ${editor.cover === value ? 'selected' : ''}>${display()}</option>`).join('')}</select><p class="form-message" id="newsletter-error" role="alert"></p><div class="newsletter-editor-actions"><button class="button outline" type="submit">${T('Save draft', 'Guardar borrador')}</button><button class="button outline" type="button" id="preview-newsletter">${T('Preview', 'Vista previa')}</button><button class="button primary" type="button" id="publish-newsletter">${editor.published ? T('Publish changes', 'Publicar cambios') : T('Publish to website', 'Publicar en el sitio')}</button></div></form>`;
  }
  function collect() {
    const form = $('#newsletter-form');
    if (!form || !editor) return;
    const fields = new FormData(form);
    editor.content[editorLanguage] = {
      title: String(fields.get('title')),
      summary: String(fields.get('summary')),
      body: String(fields.get('body')),
    };
    editor.cover = fields.get('cover');
  }
  function persist(publish = false) {
    collect();
    if (
      publish &&
      ['en', 'es'].some((l) => !editor.content[l].title.trim() || !editor.content[l].body.trim())
    ) {
      $('#newsletter-error').textContent = T(
        'Add a title and newsletter content in English and Spanish before publishing.',
        'Agrega un título y contenido en inglés y español antes de publicar.',
      );
      return;
    }
    if (publish)
      editor.published = {
        content: copy(editor.content),
        cover: editor.cover,
        date: editor.published?.date || todayKey(),
      };
    editor.updatedAt = new Date().toISOString();
    const index = entries().findIndex((n) => n.id === editor.id);
    if (index < 0) entries().push(copy(editor));
    else entries()[index] = copy(editor);
    save();
    dirty = false;
    statusMessage = publish ? 'published' : editor.published ? 'saved-live' : 'saved';
    render();
    toast(
      publish
        ? T('Newsletter published to the demo website.', 'Boletín publicado en el sitio demo.')
        : T('Draft saved.', 'Borrador guardado.'),
    );
  }
  function confirmAction(id, action) {
    const item = entries().find((n) => n.id === id);
    if (!item) return;
    openDialog(
      `<h2>${action === 'delete' ? T('Delete this newsletter?', '¿Eliminar este boletín?') : T('Take this edition off the website?', '¿Retirar esta edición del sitio?')}</h2><p>${action === 'delete' ? T('This removes its draft and published edition from this browser.', 'Esto elimina el borrador y la edición publicada de este navegador.') : T('The draft stays in your library so you can publish it again later.', 'El borrador se conserva para volver a publicarlo después.')}</p><button class="button danger full" id="confirm-newsletter-action">${action === 'delete' ? T('Delete newsletter', 'Eliminar boletín') : T('Unpublish newsletter', 'Retirar boletín')}</button>`,
    );
    $('#confirm-newsletter-action').onclick = () => {
      if (action === 'delete') {
        getState().newsletters = entries().filter((n) => n.id !== id);
        if (editor?.id === id) editor = null;
      } else {
        item.published = null;
        if (editor?.id === id) editor.published = null;
      }
      save();
      $('#dialog').close();
      render();
      toast(T('Newsletter library updated.', 'Biblioteca de boletines actualizada.'));
    };
  }
  function bind() {
    for (const id of ['new-newsletter', 'first-newsletter'])
      $('#' + id)?.addEventListener('click', () => startEditor());
    document
      .querySelectorAll('[data-edit-newsletter]')
      .forEach(
        (el) =>
          (el.onclick = () =>
            startEditor(entries().find((n) => n.id === el.dataset.editNewsletter))),
      );
    document.querySelectorAll('[data-editor-language]').forEach(
      (el) =>
        (el.onclick = () => {
          collect();
          editorLanguage = el.dataset.editorLanguage;
          render();
          $('#newsletter-title')?.focus();
        }),
    );
    $('#newsletter-form')?.addEventListener('input', () => {
      collect();
      dirty = true;
      statusMessage = '';
      $('#newsletter-save-state').textContent = T('Unsaved changes', 'Cambios sin guardar');
      $('#newsletter-error').textContent = '';
    });
    $('#newsletter-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      persist();
    });
    $('#publish-newsletter')?.addEventListener('click', () => persist(true));
    $('#preview-newsletter')?.addEventListener('click', () => {
      collect();
      openDialog(
        `<h2 class="sr-only">${T('Newsletter preview', 'Vista previa del boletín')}</h2><span class="tag">${T('PREVIEW · NOT PUBLISHED', 'VISTA PREVIA · SIN PUBLICAR')}</span>${editionMarkup({ content: editor.content, cover: editor.cover }, editorLanguage)}`,
      );
      $('#dialog').classList.add('newsletter-preview-dialog');
    });
    document
      .querySelectorAll('[data-unpublish-newsletter]')
      .forEach(
        (el) => (el.onclick = () => confirmAction(el.dataset.unpublishNewsletter, 'unpublish')),
      );
    document
      .querySelectorAll('[data-delete-newsletter]')
      .forEach((el) => (el.onclick = () => confirmAction(el.dataset.deleteNewsletter, 'delete')));
  }
  return {
    adminPage,
    publicPage,
    bind,
    collect,
    reset() {
      editor = null;
      dirty = false;
      statusMessage = '';
    },
  };
}

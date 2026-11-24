import { tourPhotos, tourPhotoSource, clampPoint } from './tour-data.js?v=20261124-walk';
import {
  availableDoorways,
  validateWalkthroughRoom,
  removeScene,
} from './walkthrough-data.js?v=20261124-walk';
export function createTour({
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
  header,
  footer,
}) {
  let activeRoom = null,
    activePoint = null,
    editor = null,
    editingLanguage = 'en',
    pointToPlace = null,
    dirty = false,
    savedMessage = false;
  let trail = [],
    visited = new Set(),
    preloaded = new Set();
  const text = (words) => words?.[getLanguage()] || '';
  const rooms = () => getState().walkthroughRooms;
  const visible = () => rooms().filter((r) => r.visible);
  function photo(room) {
    return esc(tourPhotoSource(room));
  }
  function chooseRoom(id) {
    if (!visible().some((r) => r.id === id)) return;
    if (trail.at(-2) === id) trail.pop();
    else if (trail.at(-1) !== id) trail.push(id);
    activeRoom = id;
    activePoint = null;
    visited.add(id);
    render();
    $('.walk-stage')?.focus({ preventScroll: true });
  }
  function publicPage() {
    const list = visible();
    visited = new Set([...visited].filter((id) => list.some((r) => r.id === id)));
    trail = trail.filter((id) => list.some((r) => r.id === id));
    if (!trail.length && list.length) trail = [list[0].id];
    activeRoom = trail.at(-1);
    const room = list.find((r) => r.id === activeRoom);
    if (!room)
      return `${header()}<main id="main" class="container virtual-tour"><div class="empty-state"><h1>${T('A little look around, coming soon.', 'Pronto podrás echar un vistazo.')}</h1><p>${T('Our tour is being updated. Come meet us in person.', 'Estamos actualizando el recorrido. Ven a conocernos en persona.')}</p><a class="button primary" href="#/book">${T('Book a visit', 'Agenda una visita')}</a></div></main>${footer()}`;
    visited.add(room.id);
    const links = availableDoorways(room, list),
      info = room.points.filter((p) => p.kind !== 'link'),
      point = info.find((p) => p.id === activePoint);
    return `${header()}<main id="main" class="virtual-tour connected-tour"><div class="container"><div class="walk-heading"><div><span class="hand-note">${T('Come in. Pick a door. Keep exploring.', 'Pasa. Elige una puerta. Sigue explorando.')}</span><h1>${T('Walk through <em>Little Panda.</em>', 'Recorre <em>Little Panda.</em>')}</h1></div><a class="button outline" href="#/book">${T('Visit in person', 'Visítanos en persona')}${icon('arrow')}</a></div><p class="tour-sample-label">${icon('globe')}${T('Illustrative AI demo · A fictional center, not the actual Little Panda facility.', 'Demo ilustrativa con IA · Un centro ficticio, no las instalaciones reales de Little Panda.')}</p><div class="walk-travel-bar"><button class="walk-back" id="walk-back" ${trail.length < 2 ? 'disabled' : ''}>${icon('arrow', 'back-arrow')}${T('Go back', 'Volver')}</button><nav class="walk-breadcrumbs" aria-label="${T('Your path', 'Tu camino')}">${trail.map((id, i) => `<button data-walk-trail="${i}" ${i === trail.length - 1 ? 'aria-current="location"' : ''}>${esc(text(list.find((r) => r.id === id).title))}</button>${i < trail.length - 1 ? '<span aria-hidden="true">›</span>' : ''}`).join('')}</nav><button class="walk-restart" id="walk-restart">${T('Start again', 'Reiniciar')} ↺</button></div><section class="walk-stage" tabindex="0" aria-label="${T('Connected walkthrough. Tab to a doorway arrow and press Enter to move.', 'Recorrido conectado. Usa Tab y Enter en una flecha para entrar.')}" data-scene="${room.id}"><img class="walk-scene-image" src="${photo(room)}" alt="${esc(text(room.title))} — ${T('fictional AI-generated center', 'centro ficticio generado con IA')}" fetchpriority="high"><span class="walk-photo-badge">${T('ILLUSTRATIVE DEMO', 'DEMO ILUSTRATIVA')}</span><button class="tour-enlarge" id="tour-enlarge" aria-label="${T('Enlarge photo', 'Ampliar foto')}">${icon('expand')}</button>${links.map((p) => `<button class="walk-door direction-${p.direction || 'forward'}" data-walk-to="${p.target}" style="left:${clampPoint(p.x, p.y).x}%;top:${clampPoint(p.x, p.y).y}%" aria-label="${esc(text(p.label))}"><span class="walk-door-arrow">${icon('arrow')}</span><span class="walk-door-label">${esc(text(p.label))}</span></button>`).join('')}${info.map((p, i) => `<button class="tour-hotspot ${activePoint === p.id ? 'selected' : ''}" data-tour-point="${p.id}" style="left:${clampPoint(p.x, p.y).x}%;top:${clampPoint(p.x, p.y).y}%" aria-label="${T('About', 'Acerca de')}: ${esc(text(p.label))}" aria-expanded="${activePoint === p.id}" aria-controls="tour-point-detail"><span>i</span></button>`).join('')}<span class="walk-image-hint">${icon('pin')}${T('Click an arrow to move through the center', 'Toca una flecha para recorrer el centro')}</span></section><div class="walk-scene-caption"><div><h2>${esc(text(room.title))}</h2><p>${esc(text(room.description))}</p></div>${room.returnTo && list.some((r) => r.id === room.returnTo) ? `<button class="walk-turn-back" data-walk-to="${room.returnTo}">${icon('arrow', 'back-arrow')}${T('Turn back:', 'Volver hacia:')} ${esc(text(list.find((r) => r.id === room.returnTo).title))}</button>` : ''}<span class="walk-progress">${visited.size} / ${list.length} ${T('spaces explored', 'espacios explorados')}</span></div><div id="tour-point-detail" class="tour-point-detail" aria-live="polite">${point ? `<div>${icon('pin')}<div><h3>${esc(text(point.label))}</h3><p>${esc(text(point.body))}</p></div><button class="icon-button" id="tour-close-point" aria-label="${T('Close detail', 'Cerrar detalle')}">${icon('close')}</button></div>` : ''}</div>${!links.length ? `<p class="walk-no-doors">${T('No open doorways from this view. Use Go back or Start again.', 'No hay puertas disponibles desde esta vista. Usa Volver o Reiniciar.')}</p>` : ''}<div class="tour-visit-note"><span class="hand-note">${T('Imagine the little moments. Then come meet us.', 'Imagina los pequeños momentos. Después ven a conocernos.')}</span><a class="button primary" href="#/book">${T('Book a real visit', 'Agenda una visita real')}${icon('arrow')}</a></div></div></main>${footer()}`;
  }
  function startEditor(room, discard = false) {
    if (room && editor?.id === room.id) return;
    if (dirty && !discard) {
      openDialog(
        `<h2>${T('Leave unsaved tour changes?', '¿Salir sin guardar los cambios?')}</h2><p>${T('Save first, or discard these edits to open another space.', 'Guarda primero o descarta estos cambios para abrir otro espacio.')}</p><div class="dialog-actions"><button class="button outline" id="tour-keep-editing">${T('Keep editing', 'Seguir editando')}</button><button class="button danger" id="tour-discard">${T('Discard changes', 'Descartar cambios')}</button></div>`,
      );
      $('#tour-keep-editing').onclick = () => $('#dialog').close();
      $('#tour-discard').onclick = () => {
        $('#dialog').close();
        startEditor(room, true);
      };
      return;
    }
    editor = room
      ? structuredClone(room)
      : {
          id: crypto.randomUUID(),
          title: { en: '', es: '' },
          description: { en: '', es: '' },
          photo: 'walk-reception',
          symbol: 'leaf',
          visible: true,
          sample: true,
          points: [],
        };
    editingLanguage = getLanguage();
    dirty = false;
    savedMessage = false;
    pointToPlace = null;
    render();
    $('#tour-room-title')?.focus();
  }
  function adminPage() {
    return `<div class="tour-admin-toolbar"><p>${rooms().filter((r) => r.visible).length} ${T('visible spaces', 'espacios visibles')} · ${T('All changes stay in this browser.', 'Los cambios quedan en este navegador.')}</p><button class="button primary" id="tour-add-room"><span aria-hidden="true">+</span>${T('Add a space', 'Agregar espacio')}</button></div><div class="tour-admin-layout"><section class="admin-card tour-room-library"><div class="card-heading"><h2>${T('Your spaces', 'Tus espacios')}</h2></div>${
      rooms().length
        ? rooms()
            .map(
              (r, i) =>
                `<div class="tour-library-row ${editor?.id === r.id ? 'selected' : ''}"><button data-tour-edit="${r.id}"><img src="${photo(r)}" alt=""><span><strong>${esc(text(r.title) || T('Untitled space', 'Espacio sin título'))}</strong><small>${r.visible ? T('Visible', 'Visible') : T('Hidden', 'Oculto')} · ${r.points.length} ${T('markers', 'marcadores')}</small></span></button><div class="tour-room-actions"><button class="icon-button" data-tour-move="${r.id}:-1" ${i === 0 ? 'disabled' : ''} aria-label="${T('Move up', 'Subir')} ${esc(text(r.title))}">↑</button><button class="icon-button" data-tour-move="${r.id}:1" ${i === rooms().length - 1 ? 'disabled' : ''} aria-label="${T('Move down', 'Bajar')} ${esc(text(r.title))}">↓</button><button class="text-button" data-tour-delete="${r.id}">${T('Delete', 'Eliminar')}</button></div></div>`,
            )
            .join('')
        : `<div class="empty-state"><p>${T('Add your first space to start the tour.', 'Agrega tu primer espacio para iniciar el recorrido.')}</p></div>`
    }</section><section class="admin-card tour-editor-card">${editor ? editorMarkup() : `<div class="newsletter-editor-empty">${icon('expand')}<h2>${T('Make their first visit special.', 'Haz especial su primera visita.')}</h2><p>${T('Edit each view and connect its doorway arrows to the next view. The first visible view is where the walkthrough begins.', 'Edita cada vista y conecta sus flechas con la siguiente vista. El recorrido empieza en la primera vista visible.')}</p><a class="button outline" href="#/tour">${T('Explore the sample tour', 'Explorar el recorrido demo')}${icon('arrow')}</a></div>`}</section></div>`;
  }
  function editorMarkup() {
    const l = editingLanguage;
    return `<div class="card-heading"><div><h2>${T('Edit this little space', 'Edita este espacio')}</h2><p id="tour-save-state" role="status">${dirty ? T('Unsaved changes', 'Cambios sin guardar') : savedMessage ? T('Tour changes saved.', 'Cambios guardados.') : T('Edit both languages, then save.', 'Edita ambos idiomas y guarda.')}</p></div></div><div class="newsletter-editor-tabs"><button data-tour-language="en" aria-pressed="${l === 'en'}">English</button><button data-tour-language="es" aria-pressed="${l === 'es'}">Español</button></div><form id="tour-room-form"><label for="tour-room-title">${T('Space name', 'Nombre del espacio')} · ${l === 'en' ? 'English' : 'Español'}</label><input id="tour-room-title" name="title" maxlength="70" value="${esc(editor.title[l])}"><label for="tour-room-description">${T('Short description', 'Descripción breve')} · ${l === 'en' ? 'English' : 'Español'}</label><textarea id="tour-room-description" name="description" rows="2" maxlength="300">${esc(editor.description[l])}</textarea><label for="tour-photo-choice">${T('Photo', 'Foto')}</label><select id="tour-photo-choice" name="photo">${editor.image ? `<option value="custom" selected>${T('Uploaded photo', 'Foto subida')}</option>` : ''}${tourPhotos.map((p) => `<option value="${p[0]}" ${!editor.image && editor.photo === p[0] ? 'selected' : ''}>${T(p[2], p[3])}</option>`).join('')}</select><label class="tour-upload-label" for="tour-photo-upload">${icon('download')}${T('Upload your own photo', 'Sube tu propia foto')}<input id="tour-photo-upload" type="file" accept="image/jpeg,image/png,image/webp"></label><p class="newsletter-help">${T('JPG, PNG or WebP, up to 8 MB. Use photos you have permission to share. Uploads stay in this browser.', 'JPG, PNG o WebP, hasta 8 MB. Usa fotos con permiso para compartir. Las fotos quedan en este navegador.')}</p><label class="checkbox-label"><input type="checkbox" name="visible" ${editor.visible ? 'checked' : ''}>${T('Show this space in the public tour', 'Mostrar este espacio en el recorrido')}</label><div class="tour-marker-heading"><h3>${T('Doorways & details', 'Puertas y detalles')}</h3><button class="small-button" id="tour-add-point" type="button">+ ${T('Add marker', 'Agregar marcador')}</button></div><p class="newsletter-help" id="tour-position-help">${pointToPlace ? T('Click the photo or use arrow keys to move the selected marker.', 'Haz clic en la foto o usa las flechas para mover el marcador.') : T('Select a marker below, then click the photo to move it.', 'Selecciona un marcador y haz clic en la foto para moverlo.')}</p><div class="tour-admin-photo" id="tour-admin-photo" tabindex="0" aria-label="${T('Marker placement photo. Select a marker, then click or use arrow keys to move it.', 'Foto para ubicar marcadores. Selecciona un marcador y haz clic o usa las flechas para moverlo.')}"><img src="${photo(editor)}" alt="${T('Photo used to position tour markers', 'Foto para ubicar los marcadores')}">${editor.points.map((p, i) => `<button type="button" class="tour-hotspot ${pointToPlace === p.id ? 'selected' : ''}" data-tour-select-point="${p.id}" style="left:${clampPoint(p.x, p.y).x}%;top:${clampPoint(p.x, p.y).y}%" aria-label="${T('Position marker', 'Ubicar marcador')} ${i + 1}" aria-pressed="${pointToPlace === p.id}"><span>${i + 1}</span></button>`).join('')}</div><div class="tour-point-editors">${editor.points
      .map(
        (p, i) =>
          `<fieldset data-point-editor="${p.id}"><legend>${T('Marker', 'Marcador')} ${i + 1}</legend><div class="tour-point-editor-actions"><button type="button" class="text-button" data-tour-select-point="${p.id}">${T('Position on photo', 'Ubicar en la foto')}</button><button type="button" class="text-button" data-tour-remove-point="${p.id}">${T('Remove', 'Eliminar')}</button></div><label>${T('Marker action', 'Acción del marcador')}<select data-point-kind><option value="link" ${p.kind === 'link' ? 'selected' : ''}>${T('Move to another view', 'Ir a otra vista')}</option><option value="info" ${p.kind !== 'link' ? 'selected' : ''}>${T('Show information', 'Mostrar información')}</option></select></label>${
            p.kind === 'link'
              ? `<label>${T('Destination view', 'Vista de destino')}<select data-point-target><option value="">${T('Choose a view…', 'Elige una vista…')}</option>${rooms()
                  .filter((r) => r.id !== editor.id)
                  .map(
                    (r) =>
                      `<option value="${r.id}" ${p.target === r.id ? 'selected' : ''}>${esc(text(r.title))}</option>`,
                  )
                  .join(
                    '',
                  )}</select></label><label>${T('Arrow direction', 'Dirección de la flecha')}<select data-point-direction>${[
                  ['forward', T('Forward', 'Adelante')],
                  ['left', T('Left', 'Izquierda')],
                  ['right', T('Right', 'Derecha')],
                  ['back', T('Back', 'Atrás')],
                ]
                  .map(
                    ([value, label]) =>
                      `<option value="${value}" ${(p.direction || 'forward') === value ? 'selected' : ''}>${label}</option>`,
                  )
                  .join('')}</select></label>`
              : ''
          }<label>${T('Label', 'Etiqueta')} · ${l === 'en' ? 'English' : 'Español'}<input data-point-label maxlength="65" value="${esc(p.label[l])}"></label>${p.kind !== 'link' ? `<label>${T('Detail', 'Detalle')} · ${l === 'en' ? 'English' : 'Español'}<textarea data-point-body rows="2" maxlength="400">${esc(p.body[l])}</textarea></label>` : ''}</fieldset>`,
      )
      .join(
        '',
      )}</div><p class="form-message" id="tour-error" role="alert"></p><button class="button primary full" type="submit">${T('Save tour changes', 'Guardar cambios')}${icon('check')}</button><p class="demo-note">${T('Demo tour · All photos and spaces remain labeled as illustrative. Replace them with approved real facility photos for launch.', 'Recorrido demo · Las fotos y espacios se identifican como ilustrativos. Sustitúyelos por fotos reales autorizadas antes del lanzamiento.')}</p></form>`;
  }
  function collect() {
    const f = $('#tour-room-form');
    if (!f || !editor) return;
    editor.title[editingLanguage] = f.elements.title.value;
    editor.description[editingLanguage] = f.elements.description.value;
    editor.visible = f.elements.visible.checked;
    const choice = f.elements.photo.value;
    if (choice !== 'custom') {
      editor.photo = choice;
      delete editor.image;
    }
    f.querySelectorAll('[data-point-editor]').forEach((el) => {
      const p = editor.points.find((p) => p.id === el.dataset.pointEditor);
      if (p) {
        p.label[editingLanguage] = el.querySelector('[data-point-label]').value;
        if (el.querySelector('[data-point-body]'))
          p.body[editingLanguage] = el.querySelector('[data-point-body]').value;
        p.kind = el.querySelector('[data-point-kind]').value;
        if (el.querySelector('[data-point-direction]'))
          p.direction = el.querySelector('[data-point-direction]').value;
        if (el.querySelector('[data-point-target]'))
          p.target = el.querySelector('[data-point-target]').value;
      }
    });
  }
  function markDirty() {
    dirty = true;
    savedMessage = false;
    $('#tour-save-state').textContent = T('Unsaved changes', 'Cambios sin guardar');
    $('#tour-error').textContent = '';
  }
  async function upload(file) {
    if (!file) return;
    collect();
    const original = editor.id;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      $('#tour-error').textContent = T(
        'Choose a JPG, PNG or WebP image smaller than 8 MB.',
        'Elige una imagen JPG, PNG o WebP menor de 8 MB.',
      );
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let encoded = canvas.toDataURL('image/jpeg', 0.8);
      if (encoded.length > 900000) encoded = canvas.toDataURL('image/jpeg', 0.55);
      if (encoded.length > 1200000) throw Error('large');
      if (editor?.id !== original) return;
      editor.image = encoded;
      dirty = true;
      savedMessage = false;
      render();
    } catch {
      if (editor?.id === original)
        $('#tour-error').textContent = T(
          'This image could not be loaded. Try another photo.',
          'No se pudo cargar esta imagen. Prueba otra foto.',
        );
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  function showEnlarged() {
    const room = visible().find((r) => r.id === activeRoom);
    if (!room) return;
    openDialog(
      `<h2>${esc(text(room.title))}</h2><img class="tour-enlarged-photo" src="${photo(room)}" alt="${esc(text(room.title))}"><p>${T('Illustrative sample photo. Not the actual daycare facility.', 'Foto ilustrativa de ejemplo. No son las instalaciones reales.')}</p>`,
    );
    $('#dialog').classList.add('tour-photo-dialog');
  }
  function bind() {
    document
      .querySelectorAll('[data-walk-to]')
      .forEach((el) => (el.onclick = () => chooseRoom(el.dataset.walkTo)));
    document.querySelectorAll('[data-walk-trail]').forEach(
      (el) =>
        (el.onclick = () => {
          trail = trail.slice(0, Number(el.dataset.walkTrail) + 1);
          activeRoom = trail.at(-1);
          activePoint = null;
          render();
        }),
    );
    $('#walk-back')?.addEventListener('click', () => {
      if (trail.length > 1) {
        trail.pop();
        activeRoom = trail.at(-1);
        activePoint = null;
        render();
        $('.walk-stage')?.focus({ preventScroll: true });
      }
    });
    $('#walk-restart')?.addEventListener('click', () => {
      trail = [];
      visited = new Set();
      activePoint = null;
      render();
      $('.walk-stage')?.focus({ preventScroll: true });
    });
    $('.walk-stage')?.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        $('#walk-back')?.click();
      }
      if (e.key === 'Escape' && activePoint) {
        activePoint = null;
        render();
        $('.walk-stage')?.focus();
      }
    });
    document.querySelectorAll('[data-tour-point]').forEach(
      (el) =>
        (el.onclick = () => {
          activePoint = activePoint === el.dataset.tourPoint ? null : el.dataset.tourPoint;
          render();
          document
            .querySelector(`[data-tour-point="${el.dataset.tourPoint}"]`)
            ?.focus({ preventScroll: true });
        }),
    );
    $('#tour-close-point')?.addEventListener('click', () => {
      activePoint = null;
      render();
    });
    $('#tour-enlarge')?.addEventListener('click', showEnlarged);
    const room = visible().find((r) => r.id === activeRoom);
    if (room && !navigator.connection?.saveData) {
      for (const link of availableDoorways(room, visible())) {
        const next = visible().find((r) => r.id === link.target),
          src = tourPhotoSource(next);
        if (!preloaded.has(src)) {
          preloaded.add(src);
          const image = new Image();
          image.src = src;
        }
      }
    }
    $('#tour-add-room')?.addEventListener('click', () => startEditor());
    document
      .querySelectorAll('[data-tour-edit]')
      .forEach(
        (el) => (el.onclick = () => startEditor(rooms().find((r) => r.id === el.dataset.tourEdit))),
      );
    document.querySelectorAll('[data-tour-move]').forEach(
      (el) =>
        (el.onclick = () => {
          collect();
          const [id, delta] = el.dataset.tourMove.split(':'),
            index = rooms().findIndex((r) => r.id === id),
            target = index + Number(delta);
          if (target < 0 || target >= rooms().length) return;
          [rooms()[index], rooms()[target]] = [rooms()[target], rooms()[index]];
          if (save() !== false) {
            render();
            toast(T('Tour order updated.', 'Orden del recorrido actualizado.'));
          }
        }),
    );
    document.querySelectorAll('[data-tour-delete]').forEach(
      (el) =>
        (el.onclick = () => {
          const id = el.dataset.tourDelete;
          openDialog(
            `<h2>${T('Remove this space?', '¿Eliminar este espacio?')}</h2><p>${T('Its photo and markers will be removed from this browser’s tour.', 'Su foto y marcadores se eliminarán del recorrido de este navegador.')}</p><button class="button danger full" id="tour-confirm-delete">${T('Delete space', 'Eliminar espacio')}</button>`,
          );
          $('#tour-confirm-delete').onclick = () => {
            getState().walkthroughRooms = removeScene(rooms(), id);
            if (editor && editor.id !== id) {
              editor.points = editor.points.filter((p) => p.kind !== 'link' || p.target !== id);
            }
            if (editor?.id === id) {
              editor = null;
              dirty = false;
            }
            save();
            $('#dialog').close();
            render();
          };
        }),
    );
    document.querySelectorAll('[data-tour-language]').forEach(
      (el) =>
        (el.onclick = () => {
          collect();
          editingLanguage = el.dataset.tourLanguage;
          render();
        }),
    );
    document.querySelectorAll('[data-point-kind]').forEach(
      (el) =>
        (el.onchange = () => {
          collect();
          dirty = true;
          render();
        }),
    );
    $('#tour-room-form')?.addEventListener('input', () => {
      collect();
      markDirty();
    });
    $('#tour-photo-choice')?.addEventListener('change', () => {
      collect();
      dirty = true;
      savedMessage = false;
      render();
    });
    $('#tour-photo-upload')?.addEventListener('change', (e) => upload(e.target.files[0]));
    $('#tour-add-point')?.addEventListener('click', () => {
      collect();
      const id = crypto.randomUUID();
      editor.points.push({
        id,
        kind: 'link',
        target: '',
        direction: 'forward',
        x: 50,
        y: 50,
        label: { en: '', es: '' },
        body: { en: '', es: '' },
      });
      pointToPlace = id;
      dirty = true;
      render();
      $(`[data-point-editor="${id}"] input`)?.focus();
    });
    document.querySelectorAll('[data-tour-select-point]').forEach(
      (el) =>
        (el.onclick = (e) => {
          e.stopPropagation();
          collect();
          pointToPlace = el.dataset.tourSelectPoint;
          render();
          $('#tour-admin-photo')?.focus({ preventScroll: true });
          $('#tour-admin-photo')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }),
    );
    $('#tour-admin-photo')?.addEventListener('keydown', (e) => {
      if (!pointToPlace || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key))
        return;
      e.preventDefault();
      collect();
      const p = editor.points.find((p) => p.id === pointToPlace);
      if (p) {
        Object.assign(
          p,
          clampPoint(
            p.x + (e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0),
            p.y + (e.key === 'ArrowDown' ? 5 : e.key === 'ArrowUp' ? -5 : 0),
          ),
        );
        dirty = true;
        render();
        $('#tour-admin-photo')?.focus({ preventScroll: true });
      }
    });
    $('#tour-admin-photo')?.addEventListener('click', (e) => {
      if (!pointToPlace) return;
      collect();
      const rect = e.currentTarget.getBoundingClientRect(),
        p = editor.points.find((p) => p.id === pointToPlace);
      if (p) {
        Object.assign(
          p,
          clampPoint(
            (100 * (e.clientX - rect.left)) / rect.width,
            (100 * (e.clientY - rect.top)) / rect.height,
          ),
        );
        dirty = true;
        render();
      }
    });
    document.querySelectorAll('[data-tour-remove-point]').forEach(
      (el) =>
        (el.onclick = () => {
          collect();
          editor.points = editor.points.filter((p) => p.id !== el.dataset.tourRemovePoint);
          if (pointToPlace === el.dataset.tourRemovePoint) pointToPlace = null;
          dirty = true;
          render();
        }),
    );
    $('#tour-room-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      collect();
      if (validateWalkthroughRoom(editor, [...rooms().filter((r) => r.id !== editor.id), editor])) {
        $('#tour-error').textContent = T(
          'Complete both languages and choose a different, existing destination for each doorway arrow.',
          'Completa ambos idiomas y elige una vista de destino diferente y existente para cada flecha.',
        );
        return;
      }
      const index = rooms().findIndex((r) => r.id === editor.id);
      if (index < 0) rooms().push(structuredClone(editor));
      else rooms()[index] = structuredClone(editor);
      if (save() === false) return;
      dirty = false;
      savedMessage = true;
      render();
      toast(T('Tour changes saved.', 'Cambios del recorrido guardados.'));
    });
  }
  return {
    publicPage,
    adminPage,
    bind,
    collect,
    reset() {
      trail = [];
      visited = new Set();
      activeRoom = null;
      activePoint = null;
      editor = null;
      dirty = false;
      pointToPlace = null;
    },
  };
}

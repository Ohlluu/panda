import {
  tourPhotos,
  tourPhotoSource,
  clampPoint,
  validTourRoom,
} from './tour-data.js?v=20261124-tour';
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
  const text = (words) => words?.[getLanguage()] || '';
  const rooms = () => getState().tourRooms;
  const visible = () => rooms().filter((r) => r.visible);
  function photo(room) {
    return esc(tourPhotoSource(room));
  }
  function chooseRoom(id) {
    activeRoom = id;
    activePoint = null;
    render();
  }
  function roomButtons(list) {
    return list
      .map(
        (r, i) =>
          `<button class="tour-room-button ${r.id === activeRoom ? 'active' : ''}" data-tour-room="${r.id}" aria-pressed="${r.id === activeRoom}"><span class="tour-room-number">${String(i + 1).padStart(2, '0')}</span><span>${esc(text(r.title))}</span>${icon(r.symbol || 'leaf')}</button>`,
      )
      .join('');
  }
  function publicPage() {
    const list = visible();
    if (!list.some((r) => r.id === activeRoom)) activeRoom = list[0]?.id;
    const room = list.find((r) => r.id === activeRoom);
    if (!room)
      return `${header()}<main id="main" class="container virtual-tour"><div class="empty-state"><h1>${T('A little look around, coming soon.', 'Pronto podrás echar un vistazo.')}</h1><p>${T('Our tour is being updated. Come meet us in person.', 'Estamos actualizando el recorrido. Ven a conocernos en persona.')}</p><a class="button primary" href="#/book">${T('Book a visit', 'Agenda una visita')}${icon('arrow')}</a></div></main>${footer()}`;
    const index = list.indexOf(room),
      point = room.points.find((p) => p.id === activePoint);
    return `${header()}<main id="main" class="virtual-tour"><div class="container"><div class="tour-page-heading"><div><span class="hand-note">${T('Come on in. Have a little look around.', 'Pasa y echa un vistazo.')}</span><h1>${T('A little world of <em>wonder.</em>', 'Un pequeño mundo de <em>asombro.</em>')}</h1></div><a class="button outline" href="#/book">${T('Visit in person', 'Visítanos en persona')}${icon('arrow')}</a></div><p class="tour-sample-label">${icon('globe')}${T('Photo walkthrough demo · Sample spaces and illustrative photos, not the actual Little Panda facility.', 'Demo de recorrido fotográfico · Espacios e imágenes ilustrativas, no las instalaciones reales de Little Panda.')}</p><div class="tour-layout"><aside class="tour-room-nav"><span class="tour-nav-label">${T('PICK A SPACE', 'ELIGE UN ESPACIO')}</span><nav aria-label="${T('Tour spaces', 'Espacios del recorrido')}">${roomButtons(list)}</nav><div class="tour-nav-panda"><img src="assets/favicon.svg" alt="" width="55" height="55"><span class="hand-note">${T('Follow your<br>curiosity!', '¡Sigue tu<br>curiosidad!')}</span></div></aside><section class="tour-explorer" aria-label="${esc(text(room.title))}"><div class="tour-photo-stage" tabindex="0" aria-label="${T('Tour photo. Use left and right arrow keys to change spaces.', 'Foto del recorrido. Usa las flechas izquierda y derecha para cambiar de espacio.')}"><img class="tour-room-photo" src="${photo(room)}" alt="${esc(text(room.title))} — ${T('illustrative sample photo', 'foto ilustrativa de ejemplo')}" fetchpriority="high"><span class="tour-photo-caption">${T('SAMPLE PHOTO', 'FOTO DE EJEMPLO')}</span><button class="tour-enlarge" id="tour-enlarge" aria-label="${T('Enlarge photo', 'Ampliar foto')}">${icon('expand')}</button>${room.points.map((p, i) => `<button class="tour-hotspot ${activePoint === p.id ? 'selected' : ''}" data-tour-point="${p.id}" style="left:${clampPoint(p.x, p.y).x}%;top:${clampPoint(p.x, p.y).y}%" aria-label="${T('Explore', 'Explorar')}: ${esc(text(p.label))}" aria-expanded="${activePoint === p.id}" aria-controls="tour-point-detail"><span>${i + 1}</span><i>${esc(text(p.label))}</i></button>`).join('')}<div class="tour-photo-pager"><button id="tour-prev" class="icon-button" ${index === 0 ? 'disabled' : ''} aria-label="${T('Previous space', 'Espacio anterior')}">‹</button><span>${index + 1} / ${list.length}</span><button id="tour-next" class="icon-button" ${index === list.length - 1 ? 'disabled' : ''} aria-label="${T('Next space', 'Siguiente espacio')}">›</button></div></div><div class="tour-room-story"><div><span class="tour-room-tag">${icon(room.symbol || 'leaf')}${T('A LITTLE LOOK INSIDE', 'UN PEQUEÑO VISTAZO')}</span><h2>${esc(text(room.title))}</h2><p>${esc(text(room.description))}</p></div><span class="tour-tap-hint">${icon('pin')}${T('Tap the markers <br>to discover more', 'Toca los marcadores <br>para descubrir más')}</span></div><div id="tour-point-detail" class="tour-point-detail ${point ? 'open' : ''}" aria-live="polite">${point ? `<div>${icon('pin')}<div><h3>${esc(text(point.label))}</h3><p>${esc(text(point.body))}</p></div><button class="icon-button" id="tour-close-point" aria-label="${T('Close detail', 'Cerrar detalle')}">${icon('close')}</button></div>` : ''}</div></section></div><div class="tour-thumbnails" aria-label="${T('All tour photos', 'Todas las fotos del recorrido')}">${list.map((r) => `<button data-tour-room="${r.id}" class="${r.id === activeRoom ? 'active' : ''}" aria-pressed="${r.id === activeRoom}" aria-label="${esc(text(r.title))}"><img src="${photo(r)}" alt="" loading="lazy"><span>${esc(text(r.title))}</span></button>`).join('')}</div><div class="tour-visit-note"><span class="hand-note">${T('Photos are lovely. Meeting you is better.', 'Las fotos son bonitas. Conocerte es mejor.')}</span><a class="button primary" href="#/book">${T('Come say hello', 'Ven a conocernos')}${icon('arrow')}</a></div></div></main>${footer()}`;
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
          photo: 'classroom',
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
    }</section><section class="admin-card tour-editor-card">${editor ? editorMarkup() : `<div class="newsletter-editor-empty">${icon('expand')}<h2>${T('Make their first visit special.', 'Haz especial su primera visita.')}</h2><p>${T('Choose a space to edit its photos, bilingual descriptions, and clickable markers. Use the arrows to change tour order.', 'Elige un espacio para editar sus fotos, descripciones bilingües y marcadores. Usa las flechas para cambiar el orden.')}</p><a class="button outline" href="#/tour">${T('Explore the sample tour', 'Explorar el recorrido demo')}${icon('arrow')}</a></div>`}</section></div>`;
  }
  function editorMarkup() {
    const l = editingLanguage;
    return `<div class="card-heading"><div><h2>${T('Edit this little space', 'Edita este espacio')}</h2><p id="tour-save-state" role="status">${dirty ? T('Unsaved changes', 'Cambios sin guardar') : savedMessage ? T('Tour changes saved.', 'Cambios guardados.') : T('Edit both languages, then save.', 'Edita ambos idiomas y guarda.')}</p></div></div><div class="newsletter-editor-tabs"><button data-tour-language="en" aria-pressed="${l === 'en'}">English</button><button data-tour-language="es" aria-pressed="${l === 'es'}">Español</button></div><form id="tour-room-form"><label for="tour-room-title">${T('Space name', 'Nombre del espacio')} · ${l === 'en' ? 'English' : 'Español'}</label><input id="tour-room-title" name="title" maxlength="70" value="${esc(editor.title[l])}"><label for="tour-room-description">${T('Short description', 'Descripción breve')} · ${l === 'en' ? 'English' : 'Español'}</label><textarea id="tour-room-description" name="description" rows="2" maxlength="300">${esc(editor.description[l])}</textarea><label for="tour-photo-choice">${T('Photo', 'Foto')}</label><select id="tour-photo-choice" name="photo">${editor.image ? `<option value="custom" selected>${T('Uploaded photo', 'Foto subida')}</option>` : ''}${tourPhotos.map((p) => `<option value="${p[0]}" ${!editor.image && editor.photo === p[0] ? 'selected' : ''}>${T(p[2], p[3])}</option>`).join('')}</select><label class="tour-upload-label" for="tour-photo-upload">${icon('download')}${T('Upload your own photo', 'Sube tu propia foto')}<input id="tour-photo-upload" type="file" accept="image/jpeg,image/png,image/webp"></label><p class="newsletter-help">${T('JPG, PNG or WebP, up to 8 MB. Use photos you have permission to share. Uploads stay in this browser.', 'JPG, PNG o WebP, hasta 8 MB. Usa fotos con permiso para compartir. Las fotos quedan en este navegador.')}</p><label class="checkbox-label"><input type="checkbox" name="visible" ${editor.visible ? 'checked' : ''}>${T('Show this space in the public tour', 'Mostrar este espacio en el recorrido')}</label><div class="tour-marker-heading"><h3>${T('Clickable markers', 'Marcadores interactivos')}</h3><button class="small-button" id="tour-add-point" type="button">+ ${T('Add marker', 'Agregar marcador')}</button></div><p class="newsletter-help" id="tour-position-help">${pointToPlace ? T('Click the photo or use arrow keys to move the selected marker.', 'Haz clic en la foto o usa las flechas para mover el marcador.') : T('Select a marker below, then click the photo to move it.', 'Selecciona un marcador y haz clic en la foto para moverlo.')}</p><div class="tour-admin-photo" id="tour-admin-photo" tabindex="0" aria-label="${T('Marker placement photo. Select a marker, then click or use arrow keys to move it.', 'Foto para ubicar marcadores. Selecciona un marcador y haz clic o usa las flechas para moverlo.')}"><img src="${photo(editor)}" alt="${T('Photo used to position tour markers', 'Foto para ubicar los marcadores')}">${editor.points.map((p, i) => `<button type="button" class="tour-hotspot ${pointToPlace === p.id ? 'selected' : ''}" data-tour-select-point="${p.id}" style="left:${clampPoint(p.x, p.y).x}%;top:${clampPoint(p.x, p.y).y}%" aria-label="${T('Position marker', 'Ubicar marcador')} ${i + 1}" aria-pressed="${pointToPlace === p.id}"><span>${i + 1}</span></button>`).join('')}</div><div class="tour-point-editors">${editor.points.map((p, i) => `<fieldset data-point-editor="${p.id}"><legend>${T('Marker', 'Marcador')} ${i + 1}</legend><div class="tour-point-editor-actions"><button type="button" class="text-button" data-tour-select-point="${p.id}">${T('Position on photo', 'Ubicar en la foto')}</button><button type="button" class="text-button" data-tour-remove-point="${p.id}">${T('Remove', 'Eliminar')}</button></div><label>${T('Label', 'Etiqueta')} · ${l === 'en' ? 'English' : 'Español'}<input data-point-label maxlength="65" value="${esc(p.label[l])}"></label><label>${T('Detail', 'Detalle')} · ${l === 'en' ? 'English' : 'Español'}<textarea data-point-body rows="2" maxlength="400">${esc(p.body[l])}</textarea></label></fieldset>`).join('')}</div><p class="form-message" id="tour-error" role="alert"></p><button class="button primary full" type="submit">${T('Save tour changes', 'Guardar cambios')}${icon('check')}</button><p class="demo-note">${T('Demo tour · All photos and spaces remain labeled as illustrative. Replace them with approved real facility photos for launch.', 'Recorrido demo · Las fotos y espacios se identifican como ilustrativos. Sustitúyelos por fotos reales autorizadas antes del lanzamiento.')}</p></form>`;
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
        p.body[editingLanguage] = el.querySelector('[data-point-body]').value;
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
    document.querySelectorAll('[data-tour-room]').forEach(
      (el) =>
        (el.onclick = () => {
          chooseRoom(el.dataset.tourRoom);
          document
            .querySelector(`[data-tour-room="${activeRoom}"]`)
            ?.focus({ preventScroll: true });
        }),
    );
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
      const id = activePoint;
      activePoint = null;
      render();
      document.querySelector(`[data-tour-point="${id}"]`)?.focus({ preventScroll: true });
    });
    const move = (delta) => {
      const list = visible(),
        index = list.findIndex((r) => r.id === activeRoom);
      if (list[index + delta]) {
        chooseRoom(list[index + delta].id);
        $('.tour-photo-stage')?.focus({ preventScroll: true });
      }
    };
    $('#tour-prev')?.addEventListener('click', () => move(-1));
    $('#tour-next')?.addEventListener('click', () => move(1));
    $('.tour-photo-stage')?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        move(e.key === 'ArrowRight' ? 1 : -1);
      }
      if (e.key === 'Escape' && activePoint) {
        activePoint = null;
        render();
        $('.tour-photo-stage')?.focus({ preventScroll: true });
      }
    });
    $('#tour-enlarge')?.addEventListener('click', showEnlarged);
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
            getState().tourRooms = rooms().filter((r) => r.id !== id);
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
      editor.points.push({ id, x: 50, y: 50, label: { en: '', es: '' }, body: { en: '', es: '' } });
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
      if (!validTourRoom(editor)) {
        $('#tour-error').textContent = T(
          'Add a name, description, and marker text in both English and Spanish. Remove unused markers.',
          'Agrega nombre, descripción y texto de los marcadores en inglés y español. Elimina los marcadores sin usar.',
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
      activeRoom = null;
      activePoint = null;
      editor = null;
      dirty = false;
      pointToPlace = null;
    },
  };
}

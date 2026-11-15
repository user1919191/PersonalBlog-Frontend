let editorSetupPromise

export async function ensureMdEditorSetup() {
  if (!editorSetupPromise) {
    editorSetupPromise = Promise.all([
      import('md-editor-v3'),
      import('mermaid')
    ]).then(([mdEditor, mermaidModule]) => {
      const mermaid = mermaidModule.default
      mdEditor.config({
        editorExtensions: {
          mermaid: {
            instance: mermaid
          }
        },
        mermaidConfig: base => ({
          ...base,
          startOnLoad: false,
          securityLevel: 'loose',
          flowchart: {
            ...(base?.flowchart || {}),
            htmlLabels: true
          }
        })
      })
    })
  }

  await editorSetupPromise
}

export async function loadMdPreview() {
  await ensureMdEditorSetup()
  const mdEditor = await import('md-editor-v3')
  return mdEditor.MdPreview
}

export async function loadMdCatalog() {
  await ensureMdEditorSetup()
  const mdEditor = await import('md-editor-v3')
  return mdEditor.MdCatalog
}

export async function loadMdEditor() {
  await ensureMdEditorSetup()
  const mdEditor = await import('md-editor-v3')
  return mdEditor.MdEditor
}

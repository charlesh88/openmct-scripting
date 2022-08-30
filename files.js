downloadJson = function () {
    const strJson = JSON.stringify(objJson, null, 4);
    const file = new File([strJson], 'Generated Open MCT.txt', {
        type: 'text/plain',
    })

    const link = document.createElement('a')
    const url = URL.createObjectURL(file)

    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

import api from './api'

class App {
    constructor() {
        this.repositories = JSON.parse(localStorage.getItem('listRepo')) || []
        this.form = document.querySelector('#repo-form')
        this.list = document.querySelector('#repo-list')
        this.input = document.querySelector('input[name=repository]')
        this.body = document.querySelector('body')

        this.register()
    }

    register() {
        this.form.onsubmit = event => this.addRepository(event) 
        this.body.onload = this.render()
    }

    setLoading(loading = true) {
        if(loading) {
            let loadingEl = document.createElement('span')
            loadingEl.appendChild(document.createTextNode('carregando...'))

            this.form.appendChild(loadingEl)

        } else 
            document.querySelector('span').remove()
    }

    async addRepository(event) {
        event.preventDefault()

        const repoValue = this.input.value
        const repoInput = repoValue.replace('https://github.com/', '')

        if(repoInput.lenght === 0)
            return

        this.setLoading()

        try {
            const response = await api.get(`/repos/${repoInput}`)

            const { name, description, html_url, owner: {avatar_url}} = response.data

            this.repositories.push({
                name,
                description,
                avatar_url,
                html_url
            })

            this.input.value = ''
            this.showMsg('concluded', 'O link foi salvo')
            this.render()

        } catch (err) {
            this.showMsg('error', 'O repositório não existe')
        }
        
        this.setLoading(false)
    }

    showMsg(name, msg) {
        name = document.createElement('span')
        name.appendChild(document.createTextNode(msg))
        this.form.appendChild(name)

        setTimeout(() => document.querySelector('span').remove(), 2000)
    }

    render() {
        this.saveToStorage()
        this.list.innerHTML = ''

        this.repositories.forEach(repo => {
            let img = document.createElement('img')
            img.setAttribute('src', repo.avatar_url)

            let title = document.createElement('b')
            title.appendChild(document.createTextNode(repo.name))

            let description = document.createElement('p')
            description.appendChild(document.createTextNode(repo.description))

            let link = document.createElement('a')
            link.setAttribute('href', repo.html_url)
            link.setAttribute('target', '_blank')
            link.appendChild(document.createTextNode('Acessar'))

            let exclude = document.createElement('i')
            exclude.setAttribute('class', 'fas fa-trash-alt')

            let listItem = document.createElement('li')
            listItem.appendChild(img)
            listItem.appendChild(title)
            listItem.appendChild(description)
            listItem.appendChild(link)
            listItem.appendChild(exclude)

            this.list.appendChild(listItem)

            // btn delete
            let pos = this.repositories.indexOf(repo)
            
            listItem.addEventListener('click', e => {
                if(e.target.classList.contains('fas')) {
                    this.excludeRepo(pos)
                    this.showMsg('deleted', 'O link foi excluido com sucesso')
                }
            })
        })
    }

    excludeRepo(pos) {
        this.repositories.splice(pos, 1)
        this.render()
        this.saveToStorage()
    }

    saveToStorage() {
        localStorage.setItem('listRepo', JSON.stringify(this.repositories))
    }
}

new App()
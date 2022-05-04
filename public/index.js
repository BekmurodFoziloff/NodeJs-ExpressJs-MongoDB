const toCurrency = price => {
    return new Intl.NumberFormat('ru-RU', {
        currency: 'sum',
        style: 'currency'
    }).format(price)
}

const todate = date => {
    return new Intl.DateTimeFormat('uz-UZ', {
        date: '2-digit',
        month: '2-digit',
        year: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date))
}

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent)
})

document.querySelectorAll('.date').forEach(node => {
    node.textContent = todate(node.textContent)
})

const $card = document.querySelector('#card')
if ($card) {
    $card.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id
            const csrf = event.target.dataset.csrf
            fetch('/card/remove/' + id, {
                method: 'delete',
                headers: {'X-XSRF-TOKEN': csrf},
            }).then(res => res.json())
                .then(card => {
                    if (card.courses.length) {
                        const html = card.courses.map(c => {
                            return `
                                <tr>
                                <td>${c.title}</td>
                                <td>${c.count}</td>
                                <td>
                                    <button class="btn btm-small js-remove" data-id="${c.id}">O'chirish</button>
                                </td>
                                </tr>
                                `
                        }).join('')
                        
                        $card.querySelector('tbody').innerHTML = html
                        $card.querySelector('.price').textContent = toCurrency(card.price)
                    } else {
                        $card.innerHTML = '<p>Savat bo\'sh</p>'
                    }
                })
        }

    })
}

M.Tabs.init(document.querySelectorAll('.tabs'))
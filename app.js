// require dependencies
const rp = require('request-promise')
const $ = require('cheerio')
const fs = require('fs')

// define url to scrape from
const url = 'https://www.digminecraft.com/lists/item_id_list_pc.php'

// function to write json file
const writeToJson = out => {
	data = JSON.stringify(out)
	fs.writeFileSync('output.json', data, err => {
		if (err) throw err
		console.log('Data written to json file')
	})
}

rp(url)
    .then(res => {
        const html = $.load(res)
        const output = []

        html('#minecraft_items tr').each((index, element) => {
            const item = { itemName: '', itemId: '', image: '' }

            const children = html(element).children()
            if(children['0'].type !== 'tag' || children['0'].name !== 'td') return

            item.image = 'https://www.digminecraft.com' + children['0'].children[0].attribs['data-src']

            if(children['1'].children[0].name === 'a') {
                item.itemName = children['1'].children[0].children[0].data
            } else {
                item.itemName = children['1'].children[0].data
            }
            
            let minecraftId = ''
            children['1'].children.forEach(child => {
                if(child.type === 'tag' && child.name === 'em') {
                    child.children.forEach(c => {
                        if(c.type === 'text') minecraftId += c.data
                    })
                }
            })
            item.itemId = minecraftId
            output.push(item)
        })

        // export result to json file
        writeToJson(output)
    }).catch(err => console.error(err))
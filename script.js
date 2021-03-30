// TALK IS CHEAP, SHOW ME THE CODE!

const c = (el) => document.querySelector(el);
const cs = (el) => document.querySelectorAll(el);

let cart = [];
let modalQt = 1;
let modalkey = 0;


//listagem das pizzas
pizzaJson.map((item, index) => {
    let pizzaItem = c('.models .pizza-item').cloneNode(true);
  
    //identificar pizza
    pizzaItem.setAttribute('data-key', index);

    //preencher as informações em pizzaItem
    pizzaItem.querySelector('.pizza-item--img img').src = item.img;
    pizzaItem.querySelector('.pizza-item--price').innerHTML = `R$ ${item.price[2].toFixed(2)}`;
    pizzaItem.querySelector('.pizza-item--name').innerHTML = item.name;
    pizzaItem.querySelector('.pizza-item--desc').innerHTML = item.description;

    //add evento de click para abrir modal
    pizzaItem.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        let key = e.target.closest('.pizza-item').getAttribute('data-key');
        modalQt = 1; //sempre abre modal com quantidade 1
        modalkey = key; //armazena a informação da pizza selecionada
        let priceSize = 0;

        c('.pizzaBig img').src = pizzaJson[key].img;
        c('.pizzaInfo h1').innerHTML = pizzaJson[key].name;
        c('.pizzaInfo--desc').innerHTML = pizzaJson[key].description;
        c('.pizzaInfo--actualPrice').innerHTML = `R$ ${pizzaJson[key].price[2].toFixed(2)}`;
        c('.pizzaInfo--size.selected').classList.remove('selected'); //para abrir sempre selecionado pizza grande
        cs('.pizzaInfo--size').forEach((size, sizeIndex) => {
            if(sizeIndex == 2) {
                size.classList.add('selected');
            }
            size.querySelector('span').innerHTML = pizzaJson[key].sizes[sizeIndex];
        });

        //inserindo quantidade
        c('.pizzaInfo--qt').innerHTML = modalQt;

        //abrir o modal
        c('.pizzaWindowArea').style.opacity = 0;
        c('.pizzaWindowArea').style.display = 'flex';
        //transição na abertura do modal
        setTimeout(() => {
            c('.pizzaWindowArea').style.opacity = 1;
        }, 200);
    });

    c('.pizza-area').append(pizzaItem);
});

//eventos do modal
function closeModal () {
    c('.pizzaWindowArea').style.opacity = 0;
        setTimeout(() => {
            c('.pizzaWindowArea').style.display = 'none';
        }, 200);
}

//botão cancelar
cs('.pizzaInfo--cancelButton, .pizzaInfo--cancelMobileButton').forEach((item) => {
    item.addEventListener('click', closeModal);
});

//botões de '-' e '+' quantidade
c('.pizzaInfo--qtmenos').addEventListener('click', () => {
    if (modalQt > 1) {
        modalQt --;
        c('.pizzaInfo--qt').innerHTML = modalQt;
    }
});

c('.pizzaInfo--qtmais').addEventListener('click', () => {
    modalQt ++;
    c('.pizzaInfo--qt').innerHTML = modalQt;
});

//selecionar tamanhos
cs('.pizzaInfo--size').forEach((size, sizeIndex) => {
    size.addEventListener('click', (e) => {
        //vincular preço ao tamanho da pizza
        let pizzaSize = e.currentTarget.getAttribute('data-key')
        let key = modalkey;
        let price = pizzaJson[key].price[pizzaSize];
        c('.pizzaInfo--actualPrice').innerHTML = `R$ ${price.toFixed(2)}`;

        //marcar pizza selecionada
        c('.pizzaInfo--size.selected').classList.remove('selected');
        size.classList.add('selected');

    });
});

//add ao carrinho
c('.pizzaInfo--addButton').addEventListener('click', () => {
    let size = parseInt(c('.pizzaInfo--size.selected').getAttribute('data-key'));

    //identificador de pizza para evitar duplicidade
    let identifier = pizzaJson[modalkey].id+'@'+size;
    let key = cart.findIndex((item) => item.identifier == identifier);

    //identifica o preço da pizza
    let price = pizzaJson[modalkey].price[size];

    //se já houver um item escolhido, apenas aumenta qt, se não, adiciona item
    if  (key > -1) {
        cart[key].qt += modalQt;
    } else {
        cart.push({
            identifier,
            id: pizzaJson[modalkey].id,
            size,
            qt: modalQt,
            price
        });
    }

    updateCart();
    closeModal();
});

//abrir e fechar carrinho no mobile
c('.menu-openner').addEventListener('click', () => {
    if (cart.length > 0) {
        c('aside').style.left = '0';
    }
});

c('.menu-closer').addEventListener('click', () => {
    c('aside').style.left = '100vw';
});

//atualizar o carrinho 
function updateCart () {

    //configuração para mobile
    c('.menu-openner span').innerHTML = cart.length; //informa qt de tipo de pizza no carrinho (não a qt de itens)

    if(cart.length > 0) {
        c('aside').classList.add('show'); //se houver item selecionado, exibe carrinho
        c('.cart').innerHTML = ''; //zera o carrinho a cada nova exibição

        let subtotal = 0;
        let desconto = 0;
        let total = 0;

        //mostrar itens do carrinho
        for (let i in cart) {
            let pizzaItem = pizzaJson.find((item) => item.id == cart[i].id);

            subtotal += (pizzaItem.price[cart[i].size] * cart[i].qt);

            console.log(subtotal.toFixed(2));

            let cartItem = c('.models .cart--item').cloneNode(true);

            //exibição to nome + tamanho pizza
            let pizzaSizeName;
            switch (cart[i].size) {
                case 0:
                    pizzaSizeName = 'P';
                    break;
                case 1:
                    pizzaSizeName = 'M';
                    break;
                case 2:
                    pizzaSizeName = 'G';
                    break;
            }
            let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`;

            cartItem.querySelector('img').src = pizzaItem.img;
            cartItem.querySelector('.cart--item-nome').innerHTML = pizzaName;
            cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;

            //botões de '-' e '+' quantidade
            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', () => {
                if (cart[i].qt > 1) {
                    cart[i].qt --; 
                } else {
                    cart.splice(i, 1); //remove do carrinho item com qt < 1
                }
                updateCart();;
            });

            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', () => {
                cart[i].qt ++;
                updateCart();
            });


            c('.cart').append(cartItem);
        }

        desconto = subtotal * 0.1;
        total = subtotal - desconto;

        //mostra os valores no carrinho
        c('.subtotal span:last-child').innerHTML = `R$ ${subtotal.toFixed(2)}`;
        c('.desconto span:last-child').innerHTML = `R$ ${desconto.toFixed(2)}`;
        c('.total span:last-child').innerHTML = `R$ ${total.toFixed(2)}`;

    } else {
        //fecha carrinho quando vazio
        c('aside').classList.remove('show'); 
        c('aside').style.left = '100vw'; //mobile
    }
}



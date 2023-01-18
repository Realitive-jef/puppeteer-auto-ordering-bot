var selectedItemId
var selectedColor;
var selectedSize;
var selectedQuantity = 1;
var itemId;
var setupCompleted = false;

function setupFormInteractions() {

  // まだDOMが揃ってなければ一旦停止
  if ($('[data-watch-target=variants]').length <= 0) {
    setupCompleted = false;
    return;
  }

  // サイズ選択時の挙動
  $('.btn_line').on('click', function() {
    // issue #1884 商談中の場合かごに入らない
    if($('#js-under-negotiation').data('status') == true) {
      return;
    }

    // 選択対象の挙動
    var formBlock = $(this).parents('.item-block')[0]
    $(formBlock).find('.btn_line').removeClass('active');
    $(this).toggleClass('active');

    // かごへ入れるボタンの挙動
    var allSelected = true
    $('.item-block').each(function() {
      if ($(this).attr('is-price-correction') == 'true') {
        // 価格補正アイテムは除外
        return
      }
      if ($(this).find('.btn_line.active').length <= 0) {
        allSelected = false
      }
    });
    if (allSelected) {

      // かごへ入れるボタンを一旦リセット
      var mes = $('#translationParts #addToCart').text()
      $('#add_to_cart_button').text(mes)
      $('.cart_btn').addClass('cart_active');
      $('.cart_btn').removeClass('cart_disabled');
      $('.cart_btn').prop('disabled', true);
      $('#to_cart_button').hide();
      // かごからのメッセージをリセット
      $('#addCartFeedback').stop(true, false).html(null)

      $('.cart_btn').removeClass('cart_active');
      $('.cart_btn').prop('disabled', false);

      // フォームの値をセット
      selectedColor = $(this).attr('data-color');
      selectedSize = $(this).attr('data-size');
      selectedItemId = $(this).attr('data-item-id');

    }
  });

  // cart_btn active 表示
  $('#add_to_cart_button').on('click', function() {
    // issue #1884 商談中の場合かごに入らない、念のためここでも止めておく
    if($('#js-under-negotiation').data('status') == true) {
      return;
    }

    // カートにアイテムを入れる
    var endpoint, args;
    if (typeof isAssort != 'undefined' && isAssort) {
      // アソートの場合
      endpoint = storeURL + "/online_store/cart/add_assort.json";
      args = { assort_id: assortId }
      var idx = 0;
      $('.item-block').each(function() {
        var button = $(this).find('.btn_line.active')
        var key = "items[" + idx + "]";
        if (button.length > 0) {
          args[key + "[itemId]"] = $(button).attr('data-item-id')
          args[key + "[color]"] = $(button).attr('data-color')
          args[key + "[size]"] = $(button).attr('data-size')
          args[key + "[quantity]"] = 1;
        } else {
          // 価格補正アイテム
          args[key + "[itemId]"] = $(this).find('input[name=correctionItemId]').val()
          args[key + "[color]"] = '0'
          args[key + "[size]"] = '0'
          args[key + "[quantity]"] = 1;
        }
        idx ++;
      });
    } else {
      // 通常商品の場合
      endpoint = storeURL + "/online_store/cart/add.json";
      args = {
        "items[ids[0]]": selectedItemId,
	    "items[size]": selectedSize,
	    "items[color]": selectedColor,
	    "items[quantity]": selectedQuantity
      };
    }
    if ($('#translationStatusHolder').attr('data-translation-status') == 'true') {
      endpoint += '?language=en'
    } else {
      endpoint += '?language=ja'
    }

    $.ajax({
      type: 'GET',
      url: endpoint,
      xhrFields: {
        withCredentials: true
      },
      data: args
    }).done(function(data) {
      if (data['status'] == 'success') {
        // 成功
        var mes = $('#translationParts #added').text()
        $('#add_to_cart_button').text(mes).addClass('cart_active');;
        // 更新時を変更してイベントを走らせる
        $('#jq-unixtime').val(Math.round((new Date()).getTime() / 1000)).change();
        //$('#add_to_cart_button').delay(1000).queue(function(){
        setTimeout(function(){
          $('#add_to_cart_button').removeClass('cart_active');
          $('#add_to_cart_button').addClass('cart_disabled');
          var mes = $('#translationParts #addToCart').text()
          $('#add_to_cart_btn').text(mes);
          $('#to_cart_button').show().click(function() {
            var cartPath = "/online_store/cart/"
            if ($('#translationStatusHolder').attr('data-translation-status') == 'true') {
              cartPath += '?language=en'
            } else {
              cartPath += '?language=ja'
            }
            location.href = storeURL + cartPath;
          })
        }, 0);
      } else {
        // 失敗
        $(this).removeClass('cart_active');
        $(this).addClass('cart_disabled');
        var mes = $('#translationParts #addToCart').text()
        $('#add_to_cart_button').text(mes);
        $('#addCartFeedback').html(data['notice']).delay(3000).queue(function() {
          $(this).html(null)
          // ボタンの復旧ほか、失敗時の後処理
        });
      }
    });
  });

  // select ラベル変更
  $('.form_select').on('change', function(){
    var $this = $(this)
    var $option = $this.find('option:selected');
    $('.form_select_label').text($option.text());
    $('.cart_btn').removeClass('cart_active');
    var mes = $('#translationParts #addToCart').text()
    $('add_to_cart_button').html('<span class="icon"></span>' + mes);
    // onchange後にフォーカス外す
    $this.blur();

    selectedQuantity = $(this).find('select option:selected').val();
  });

  // qtyの初期値が1でない場合に対応
  var initQty = $("#headingQtyValue").attr('data-value');
  if (initQty != null) selectedQuantity = initQty;

  setupCompleted = true;
};

function initializeFormInteractions() {
  // DOMが2度構築される場合・DOM入れ替えによるページ遷移場合のため常時監視する
  if (! setupCompleted) {
    setupFormInteractions();
  }
  setTimeout(function() {
    initializeFormInteractions()
  }, 500);
}


async function adminTest(action) {
  try {
    let url = window.location.toString()
    console.log('admin-test');
    if (url.includes('catalog/product/new')) {
      await userType(action.pid, '.name input', 'test-product-name-' + Date.now())
      await userClick(action.pid, '.is_enabled span')

      await userClick(action.pid, '#tab-Pricing')
      await userType(action.pid, '.regular_price input', 11)

      await userClick(action.pid, '#tab-Inventory')
      await userType(action.pid, '.stock-status-container input', 'force-in-stock')

      getElementContainsInnerText('button', 'Save & continue').click()
    } else if (url.includes('catalog/product/edit')) {
      await goToLocation(action.pid, APP_URL + '/sales/orders/new')
    } else if (url.includes('catalog/product')) {
      getElementContainsInnerText('button', 'Add New Product').click()
      await sleep(2000)
      getElementContainsInnerText('button', 'Continue').click()
    } else if (url.includes('sales/orders/new')) {

      getElementContainsInnerText('button', 'Add Customer').click()
      await waitForSelector('.customers-grid input')
      await userTypeEnter(action.pid, '.customers-grid input', 'kimtrong@wiserobot.com')
      await sleep(2000)
      await userClick(action.pid, '.box button .bi-check2-circle')

      getElementContainsInnerText('button', 'Add Products').click()
      getElementContainsInnerText('button', 'Add to Order').click()
      getElementContainsInnerText('button', 'Return to Order').click()
      getElementContainsInnerText('button', 'Add Shipping Address').click()
      await userClick(action.pid, '.box button .bi-check2-circle')
      getElementContainsInnerText('button', 'Add Billing Method').click()
      getElementContainsInnerText('button', 'Pay by Invoice').click()
      getElementContainsInnerText('button', 'Continue').click()
      getElementContainsInnerText('button', 'Place Order').click()
    }
    else if (url.indexOf('sales/orders-management') > -1) {
      getElementContainsInnerText('button', 'Add Order').click()
    }

    return
  } catch (error) {
    
  }
}

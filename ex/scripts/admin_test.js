
async function adminTest(action) {
  try {
    let url = window.location.toString()
console.log('admin-test');


    if (url.includes('catalog/product/new')) {
      await userType(action.pid, '.name input', 'test-product-name-' + Date.now())
      await userClick(action.pid, '.is_enabled span')
      getElementContainsInnerText('button', 'Save & continue').click()
    } else  
    if (url.includes('catalog/product')) {
      getElementContainsInnerText('button', 'Add New Product').click()
      await sleep(2000)
      getElementContainsInnerText('button', 'Continue').click()
    } else 
    if (url.includes('sales/orders/new')) {
      getElementContainsInnerText('button', 'Add Customer').click()
      
    }
    else if (url.indexOf('sales/orders-management') > -1) {
      getElementContainsInnerText('button', 'Add Order').click()
    }

    return
  } catch (error) {
    
  }
}

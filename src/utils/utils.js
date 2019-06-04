import { getNetworkId } from '../web3'
import uts46 from 'idna-uts46-hx'
import { addressUtils } from '@0xproject/utils'
import { tlds } from '../constants/tlds'
//import { checkLabelHash } from '../updaters/preImageDB'

export const uniq = (a, param) =>
  a.filter(
    (item, pos) => a.map(mapItem => mapItem[param]).indexOf(item[param]) === pos
  )

export async function getEtherScanAddr() {
  const networkId = await getNetworkId()
  switch (networkId) {
    case 1:
    case '1':
      return 'https://etherscan.io/'
    case 3:
    case '3':
      return 'https://ropsten.etherscan.io/'
    case 4:
    case '4':
      return 'https://rinkeby.etherscan.io/'
    default:
      return 'https://etherscan.io/'
  }
}

export async function ensStartBlock() {
  const networkId = await getNetworkId()
  switch (networkId) {
    case 1:
    case '1':
      return 3327417
    case 3:
    case '3':
      return 25409
    default:
      return 0
  }
}

export const checkLabels = (...labelHashes) => labelHashes.map(hash => null)

// export const checkLabels = (...labelHashes) =>
//   labelHashes.map(labelHash => checkLabelHash(labelHash) || null)

export const mergeLabels = (labels1, labels2) =>
  labels1.map((label, index) => (label ? label : labels2[index]))

export function validateName(name) {
  const hasEmptyLabels = name.split('.').filter(e => e.length < 1).length > 0
  if (hasEmptyLabels) throw new Error('Domain cannot have empty labels')
  try {
    return uts46.toUnicode(name, {
      useStd3ASCII: true,
      transitional: false
    })
  } catch (e) {
    throw e
  }
}

export function isLabelValid(name) {
  try {
    validateName(name)
    if (name.indexOf('.') === -1) {
      return true
    }
  } catch (e) {
    console.log(e)
    return false
  }
}

export const parseSearchTerm = term => {
  let regex = /[^.]+$/

  try {
    validateName(term)
  } catch (e) {
    return 'invalid'
  }

  if (term.indexOf('.') !== -1) {
    const termArray = term.split('.')
    const tld = term.match(regex) ? term.match(regex)[0] : ''

    if (tlds[tld] && tlds[tld].supported) {
      if (tld === 'eth' && termArray[termArray.length - 2].length < 7) {
        return 'short'
      }
      return 'supported'
    }

    return 'unsupported'
  } else if (addressUtils.isAddress(term)) {
    return 'address'
  } else {
    //check if the search term is actually a tld
    if (Object.keys(tlds).filter(tld => term === tld).length > 0) {
      return 'tld'
    }
    return 'search'
  }
}

export function modulate(value, rangeA, rangeB, limit) {
  let fromHigh, fromLow, result, toHigh, toLow
  if (limit == null) {
    limit = false
  }
  fromLow = rangeA[0]
  fromHigh = rangeA[1]
  toLow = rangeB[0]
  toHigh = rangeB[1]
  result = toLow + ((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow)
  if (limit === true) {
    if (toLow < toHigh) {
      if (result < toLow) {
        return toLow
      }
      if (result > toHigh) {
        return toHigh
      }
    } else {
      if (result > toLow) {
        return toLow
      }
      if (result < toHigh) {
        return toHigh
      }
    }
  }
  return result
}

export function isElementInViewport(el) {
  var rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight ||
        document.documentElement.clientHeight) /*or $(window).height() */ &&
    rect.right <=
      (window.innerWidth ||
        document.documentElement.clientWidth) /*or $(window).width() */
  )
}

export const emptyAddress = '0x0000000000000000000000000000000000000000'

export function isDecrypted(name) {
  const label = name.split('.')[0]
  return label.length === 66 && label.startsWith('0x') ? false : true
}

export function encodeLabelHash(hash) {
  if (!hash.startsWith('0x')) {
    throw new Error('Expected label hash to start with 0x')
  }

  if (hash.length !== 66) {
    throw new Error('Expected label hash to have a length of 66')
  }

  return `[${hash.slice(2)}]`
}

export function decodeLabelHash(hash) {
  if (!(hash.startsWith('[') && hash.endsWith(']'))) {
    throw Error(
      'Expected encoded labelhash to start and end with square brackets'
    )
  }

  if (hash.length !== 66) {
    throw Error('Expected encoded labelhash to have a length of 66')
  }

  return `0x${hash.slice(1, -1)}`
}

export function isEncodedLabelHash(hash) {
  return hash.startsWith('[') && hash.endsWith(']') && hash.length === 66
}

import React, {Component} from 'react'
import {Button} from 'antd'
import {descartes, getPrime, PathFinder} from './components/'
import 'antd/dist/antd.css'

export default class Demo extends Component {
  state = {
    // type: 规格类型
    type: [
      ['男裤', '女裤'],
      ['黑色', '白色'],
      ['S', 'L']
    ],
    selected: [], // 已经选中的规格
    enabledAttributes: [], // 可选规格
    availableSku: [], // 可用sku
    valueInLabel: {} // 质数，规格枚举值
  }
  // 预留sku工具包
  pathFinder

  componentDidMount() {
    // 获取全部规格
    const {type} = this.state
    // 抹平规格内容
    const types = type.flat() // ['男裤', '女裤', '黑色', '白色', 'S', 'L']
    // 通过抹平规格，获取规格对应质数
    const prime = getPrime(types.length)
    // 质数对应规格数 枚举值处理
    const valueInLabel = {}
    types.forEach((item, index) => {
      valueInLabel[item] = prime[index]
    })

    // 根据规格坐标，排序质数坐标
    const way = type.map((i) => {
      return i.map(ii => valueInLabel[ii])
    })
    // 使用笛卡尔积计算下sku
    const sku = descartes(type).map((item) => {
      return {
        // 随机库存内容
        stock: Math.floor(Math.random() * 10) > 5 ? 0 : 1,
        // 规格名
        skuName: item,
        // 规格对应质数
        skuPrime: item.map(ii => valueInLabel[ii])
      }
    })
    // 筛选可选的 SKU
    const availableSku = sku.filter(item => item.stock)
    // 初始化规格展示内容
    this.pathFinder = new PathFinder(way, availableSku.map(item => item.skuPrime))
    // 获取可选规格内容
    const enabledAttributes = this.pathFinder.getWay().flat()

    this.setState({
      availableSku,
      enabledAttributes,
      valueInLabel
    })
  }

  /**
   * 点击选择规格
   * @param {String} type
   * @param {Number} prime
   */
  onClickSelType = (type, prime) => {
    // 获取已经选中的规格
    const {selected} = this.state
    // 检查此次选择是否在已选内容中
    const index = selected.indexOf(type)
    // 如果未选中则提供选中，如果选中移除
    if (index > -1) {
      this.pathFinder.remove(prime)
      selected.splice(index, 1)
    } else {
      this.pathFinder.add(prime)
      selected.push(type)
    }

    // 更新可选规格
    const enabledAttributes = this.pathFinder.getWay().flat()

    this.setState({
      selected,
      enabledAttributes
    })
  }

  render() {
    const {type, selected, enabledAttributes, availableSku, valueInLabel} = this.state

    const typeBtns = type.map((item) => {
      return (
        <div style={{margin: 10}}>
          {
            item.map((btn) => {
              return (
                <Button
                  style={{margin: '0 10px'}}
                  type={selected.includes(btn) ? 'primary' : ''}
                  disabled={!enabledAttributes.includes(valueInLabel[btn])}
                  onClick={() => this.onClickSelType(btn, valueInLabel[btn])}
                >
                  {btn}
                </Button>
              )
            })
          }
        </div>
      )
    })

    const canUseSkuNode = availableSku.map((item) => {
      return (
        <Button style={{margin: '0 10px'}}>{item.skuName}</Button>
      )
    })
    return (
      <div style={{margin: 100}}>
        <h3>React SKU 展示模版</h3>
        <div>
          规格：
          {typeBtns}
          可选的SKU：
          {canUseSkuNode}
        </div>
      </div>
    )
  }
}

<tr>
  <td>Property Management Expense ({this.state.model.propertyManagerPercentageOfGrossRent * 100}%)</td>
  <td>
    <NumberFormat
      value = { this.state.model.propertyManagerPercentageOfGrossRent * sumRents() }
      name={'pmMonth'}
      thousandSeparator={true}
      prefix={'$('}
      suffix={')'}
      defaultValue = {0}
      fixedDecimalScale = {true}
      decimalScale = {2}
      displayType = {'text'}
    />
  </td>

  <td>
    <NumberFormat
      value = { this.state.model.propertyManagerPercentageOfGrossRent * sumRents() * 12 }
      name={'pmYear'}
      thousandSeparator={true}
      prefix={'$('}
      suffix={')'}
      defaultValue = {0}
      fixedDecimalScale = {true}
      decimalScale = {2}
      displayType = {'text'}
    />
  </td>

</tr>

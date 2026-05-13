provider "azurerm" {
  features {}
}

resource "azurerm_public_ip" "terraform_ip" {
  name                = "terraform-demo-ip"
  location            = "West Europe"
  resource_group_name = "joke-microservices-rg"
  allocation_method   = "Static"
}

resource "azurerm_network_interface" "terraform_nic" {
  name                = "terraform-demo-nic"
  location            = "West Europe"
  resource_group_name = "joke-microservices-rg"

  ip_configuration {
    name                          = "internal"
    subnet_id                     = "/subscriptions/a3bb0fd9-78b5-46cf-9def-276769340d7c/resourceGroups/joke-microservices-rg/providers/Microsoft.Network/virtualNetworks/vnet-westeurope/subnets/snet-westeurope-2"
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.terraform_ip.id
  }
}

resource "azurerm_linux_virtual_machine" "terraform_vm" {
  name                = "terraform-demo-vm"
  resource_group_name = "joke-microservices-rg"
  location            = "West Europe"
  size                = "Standard_D2ls_v5"

  admin_username = "azureuser"
  admin_password = "Password1234!"

  disable_password_authentication = false

  network_interface_ids = [
    azurerm_network_interface.terraform_nic.id
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }
}
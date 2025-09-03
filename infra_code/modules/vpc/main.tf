locals {
  common_tags = {
    application = var.application
    environment = var.environment
    created_by  = var.created_by
  }
  name_prefix = "${var.application}-${var.environment}"
}

data "aws_availability_zones" "aws_availability_zones" {
  state = "available"

  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

data "aws_region" "current_region" {}

resource "aws_vpc" "smart-route-finder_prod_vpc" {
  cidr_block           = var.cidr_block
  region               = var.region
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-vpc"
  })
}

resource "aws_internet_gateway" "smart-route-finder-igw" {
  vpc_id = aws_vpc.smart-route-finder_prod_vpc.id

  depends_on = [aws_vpc.smart-route-finder_prod_vpc]

  tags = merge(local.common_tags, {
  Name = "${local.name_prefix}-prd-igw" })
}

resource "aws_eip" "smart-route-finder-eip" {
  domain = "vpc"

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-nat-eip"
  })
}

resource "aws_nat_gateway" "nat-aws_nat_gateway" {
  subnet_id     = aws_subnet.smart-route-finder-public-subnet[0].id
  allocation_id = aws_eip.smart-route-finder-eip.id

  depends_on = [aws_subnet.smart-route-finder-public-subnet, aws_eip.smart-route-finder-eip]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-nat-gateway"
  })
}

resource "aws_subnet" "smart-route-finder-public-subnet" {

  count = min(length(data.aws_availability_zones.aws_availability_zones.names), 3)

  vpc_id                  = aws_vpc.smart-route-finder_prod_vpc.id
  cidr_block              = cidrsubnet(var.cidr_block, 8, count.index)
  availability_zone       = data.aws_availability_zones.aws_availability_zones.names[count.index]
  map_public_ip_on_launch = true

  depends_on = [aws_vpc.smart-route-finder_prod_vpc]

  tags = merge(local.common_tags, {
    Name = "${data.aws_availability_zones.aws_availability_zones.names[count.index]}-${local.name_prefix}-public-subnet"
    Type = "Public"
    AZ   = data.aws_availability_zones.aws_availability_zones.names[count.index]
  })
}

resource "aws_subnet" "smart-route-finder-private-subnet" {

  count = min(length(data.aws_availability_zones.aws_availability_zones.names), 3)

  vpc_id            = aws_vpc.smart-route-finder_prod_vpc.id
  cidr_block        = cidrsubnet(var.cidr_block, 8, count.index + 10)
  availability_zone = data.aws_availability_zones.aws_availability_zones.names[count.index]

  depends_on = [aws_vpc.smart-route-finder_prod_vpc]

  tags = merge(local.common_tags, {
    Name = "${data.aws_availability_zones.aws_availability_zones.names[count.index]}-${local.name_prefix}-private-subnet"
  })
}

resource "aws_route_table" "smart-route-finder-public-subnet" {
  vpc_id = aws_vpc.smart-route-finder_prod_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.smart-route-finder-igw.id
  }

  depends_on = [aws_vpc.smart-route-finder_prod_vpc, aws_internet_gateway.smart-route-finder-igw]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-rt"
  })
}

resource "aws_route_table" "smart-route-finder-private-subnet" {
  vpc_id = aws_vpc.smart-route-finder_prod_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.nat-aws_nat_gateway.id
  }

  depends_on = [aws_vpc.smart-route-finder_prod_vpc, aws_nat_gateway.nat-aws_nat_gateway]

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-private-rt"
  })
}

resource "aws_route_table_association" "public_route_table_association" {
  count          = length(aws_subnet.smart-route-finder-public-subnet)
  subnet_id      = aws_subnet.smart-route-finder-public-subnet[count.index].id
  route_table_id = aws_route_table.smart-route-finder-public-subnet.id

  depends_on = [aws_route_table.smart-route-finder-public-subnet]
}

resource "aws_route_table_association" "private_route_table_association" {
  count          = length(aws_subnet.smart-route-finder-private-subnet)
  subnet_id      = aws_subnet.smart-route-finder-private-subnet[count.index].id
  route_table_id = aws_route_table.smart-route-finder-private-subnet.id

  depends_on = [aws_route_table.smart-route-finder-private-subnet]
}

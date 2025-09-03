output "subnet_ids" {
  value = aws_subnet.smart-route-finder-private-subnet[*].id
}
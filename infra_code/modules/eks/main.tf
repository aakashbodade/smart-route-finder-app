resource "aws_iam_role" "eks_cluster" {
  name = "smart_route_finder_eks_cluster_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = ["sts:AssumeRole", "sts:TagSession"]
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.id
}

resource "aws_eks_cluster" "smart_route_finder_eks_cluster" {
  name   = "smart_route_finder_eks_cluster"
  region = "ap-south-1"


  access_config {
    authentication_mode = "API"
  }

  vpc_config {
    subnet_ids = var.subnet_ids
  }

  role_arn = aws_iam_role.eks_cluster.arn

  depends_on = [ aws_iam_role_policy_attachment.policy_attachment]

}

resource "aws_iam_role" "node_group_role" {
  name = "smart_route_finder_eks_node_group_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node_group_role.id
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.node_group_role.id
}

resource "aws_iam_role_policy_attachment" "eks_EC2_Container_Registry_ReadOnly_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.node_group_role.id
}

resource "aws_eks_node_group" "eks_node_group" {
  cluster_name    = aws_eks_cluster.smart_route_finder_eks_cluster.name
  node_group_name = "smart_route_finder_eks_node_group"
  node_role_arn   = aws_iam_role.node_group_role.arn
  subnet_ids      = var.subnet_ids

  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }

  instance_types = ["t2.micro"]
  ami_type       = "AL2023_x86_64_STANDARD"

  depends_on = [aws_iam_role_policy_attachment.eks_EC2_Container_Registry_ReadOnly_policy,
    aws_iam_role_policy_attachment.eks_worker_node_cni_policy,
  aws_iam_role_policy_attachment.eks_worker_node_policy]

}
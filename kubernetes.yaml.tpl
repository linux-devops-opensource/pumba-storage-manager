apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/component: storage-manager
    app.kubernetes.io/name: pumba-storage-manager
    app.kubernetes.io/part-of: pumba
    app.kubernetes.io/managed-by: argocd
  name: pumba-storage-manager
  namespace: pumba
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: pumba-storage-manager
  strategy:
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
    type: RollingUpdate
  template:
    metadata:
      labels:
        app.kubernetes.io/name: pumba-storage-manager
    spec:
      containers:
      - image: gcr.io/GOOGLE_CLOUD_PROJECT/pumba-storage-manager:COMMIT_SHA
        name: pumba-storage-manager
        ports:
        - containerPort: 5000
          protocol: TCP
        resources:
          requests:
              memory: "50Mi"
              cpu: "50m"
          limits:
              memory: "250Mi"
              cpu: "250m"

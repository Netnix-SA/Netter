sudo apt update -y
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev -y

curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
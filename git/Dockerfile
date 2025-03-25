FROM debian:10.13-slim

RUN apt update
# RUN apt -t 2.34.1 install git -y
RUN apt install git openssh-server -y

RUN mkdir /var/run/sshd

RUN echo 'PermitEmptyPasswords no' >> /etc/ssh/sshd_config
RUN echo 'PermitRootLogin no' >> /etc/ssh/sshd_config
RUN echo 'PubkeyAuthentication yes' >> /etc/ssh/sshd_config
# RUN echo 'AuthorizedKeysFile /home/git/.ssh/authorized_keys' >> /etc/ssh/sshd_config

RUN useradd -m git

USER git

RUN mkdir ~/.ssh
RUN touch ~/.ssh/authorized_keys
COPY key.pub ~/.ssh/authorized_keys
RUN chmod 700 ~/.ssh
RUN chmod 600 ~/.ssh/authorized_keys

EXPOSE 22

USER 0

ENTRYPOINT [ "bash", "-c", "cp /home/root/.ssh/authorized_keys /home/git/.ssh/authorized_keys && chown git /home/git/.ssh/authorized_keys && chmod 600 /home/git/.ssh/authorized_keys && /usr/sbin/sshd -d" ]
# GitHub Push Webhook Listener

Bunの練習に作った、GitHubのブランチpush通知をWebhookで受け取って対応するスクリプトを実行するWebアプリです。

## インストール

systemdサービスとしてインストールする例です。前提として、Bunがインストールされている必要があります。

```bash
# 環境に合わせサンプル設定ファイルを編集
cp github-push-webhook-listener.service.example github-push-webhook-listener.service
cp example.env deploy.env
nano github-push-webhook-listener.service
nano deploy.env

# サービスを登録して起動
sudo chown root:root github-push-webhook-listener.service
mv github-push-webhook-listener.service /etc/systemd/system/
ln -s /etc/systemd/system/github-push-webhook-listener.service .
systemctl daemon-reload
systemctl enable github-push-webhook-listener
systemctl start github-push-webhook-listener
```

## 設定が必要な箇所

| ファイル | 項目 | 説明 |
| --- | --- | --- |
| `github-push-webhook-listener.service` | `WorkingDirectory` | これをクローンしたディレクトリを設定してください。 |
| `github-push-webhook-listener.service` | `User` | 実行ユーザーを設定してください。 |
| `github-push-webhook-listener.service` | `Group` | 実行グループを設定してください。 |
| `github-push-webhook-listener.service` | `ExecStart` | Bunのインストールパスが異なる場合調整してください。 |
| `deploy.env` | `PORT` | 待ち受けポート番号を設定してください。 |
| `deploy.env` | `URL_PATH` | Webhookを待ち受けるURLパスを設定してください。 |
| `deploy.env` | `WEBHOOK_SECRET` | Webhookのシークレットを設定してください。 |
| `deploy.env` | `HOOK_SCRIPTS` | ブランチ名とそのブランチがpushされたときに実行するシェルスクリプトのペアをJSON形式で指定してください。<br>例: `{"main": "/var/www/app/myapp-main/cli/update.sh"}` |

環境変数は`systemctl edit`で設定することもできますが、JSONのエスケープが不便なので`deploy.env`ファイルで設定することをお勧めします。

## 利用ツール

- [Bun](https://bun.sh/)
- [Biome](https://biome.dev/)
- [TypeScript](https://typescriptlang.org/)

`make format`でフォーマット、`make check`で型チェックおよびリントができます。

## ライセンス

Licensed under the MPL-2.0 by nijiurachan contributors.
